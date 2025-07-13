export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.query;

  if (!publicId) {
    return res.status(400).json({ error: 'publicId is required' });
  }

  try {
    const response = await fetch(`https://api.edenai.run/v2/video/generation_async/${publicId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log('=== EDEN AI RESPONSE DEBUG ===');
    console.log('Public ID:', publicId);
    console.log('Full Response:', JSON.stringify(data, null, 2));

    // Check if video is still processing
    if (data.status === 'processing') {
      return res.status(200).json({
        success: true,
        status: 'processing',
        message: 'Video is still being generated. Please wait and try again.',
        publicId: publicId,
        lastChecked: new Date().toLocaleTimeString()
      });
    }

    // Check if video generation completed
    if (data.status === 'completed' || data.status === 'finished') {
      console.log('Video completed! Extracting video URL...');
      
      let videoUrl = null;
      let debugInfo = {
        hasResults: false,
        hasAmazonResults: false,
        videoUrlFound: false,
        searchPaths: [],
        allProviderKeys: [],
        allFields: {}
      };
      
      // Comprehensive URL extraction with detailed debugging
      if (data.results) {
        debugInfo.hasResults = true;
        debugInfo.allProviderKeys = Object.keys(data.results);
        console.log('Results keys:', debugInfo.allProviderKeys);
        
        // Method 1: Check for exact amazon/amazon.nova-reel-v1:0 key
        const amazonKey = 'amazon/amazon.nova-reel-v1:0';
        if (data.results[amazonKey]) {
          debugInfo.hasAmazonResults = true;
          const amazonResult = data.results[amazonKey];
          console.log('Amazon result found with key:', amazonKey);
          console.log('Amazon result keys:', Object.keys(amazonResult));
          console.log('Amazon result content:', JSON.stringify(amazonResult, null, 2));
          
          // Store all fields for debugging
          debugInfo.allFields.amazonResult = amazonResult;
          
          // Check all possible URL fields
          const urlFields = [
            'video_resource_url',
            'resource_url', 
            'video_url',
            'url',
            'video_file_url',
            'file_url',
            'output_url',
            'download_url',
            'media_url',
            'video_link',
            'link',
            'video_path',
            'path',
            'video_file',
            'file',
            'video_output',
            'output',
            'download_link',
            'media_link',
            'video_download_url'
          ];
          
          for (const field of urlFields) {
            debugInfo.searchPaths.push(`data.results['${amazonKey}'].${field}`);
            if (amazonResult[field]) {
              videoUrl = amazonResult[field];
              debugInfo.videoUrlFound = true;
              console.log(`Found video URL in field '${field}':`, videoUrl);
              break;
            }
          }
          
          // Check nested objects for URLs
          if (!videoUrl) {
            for (const [key, value] of Object.entries(amazonResult)) {
              if (value && typeof value === 'object') {
                for (const field of urlFields) {
                  debugInfo.searchPaths.push(`data.results['${amazonKey}'].${key}.${field}`);
                  if (value[field]) {
                    videoUrl = value[field];
                    debugInfo.videoUrlFound = true;
                    console.log(`Found video URL in nested field '${key}.${field}':`, videoUrl);
                    break;
                  }
                }
                if (videoUrl) break;
              }
            }
          }
        }
        
        // Method 2: Check for any amazon-related key (fuzzy matching)
        if (!videoUrl) {
          for (const [key, result] of Object.entries(data.results)) {
            if (key.toLowerCase().includes('amazon') || key.toLowerCase().includes('nova')) {
              debugInfo.hasAmazonResults = true;
              console.log('Found Amazon-related key:', key);
              debugInfo.searchPaths.push(`data.results['${key}'].resource_url`);
              debugInfo.searchPaths.push(`data.results['${key}'].video_url`);
              
              if (result && typeof result === 'object') {
                const urlFields = [
                  'video_resource_url',
                  'resource_url',
                  'video_url',
                  'url',
                  'video_file_url',
                  'file_url',
                  'output_url',
                  'download_url',
                  'media_url',
                  'video_link',
                  'link'
                ];
                
                for (const field of urlFields) {
                  if (result[field]) {
                    videoUrl = result[field];
                    debugInfo.videoUrlFound = true;
                    console.log(`Found video URL in ${key}.${field}:`, videoUrl);
                    break;
                  }
                }
                if (videoUrl) break;
              }
            }
          }
        }
        
        // Method 3: Loop through all results to find any video URL
        if (!videoUrl) {
          for (const [key, result] of Object.entries(data.results)) {
            debugInfo.searchPaths.push(`data.results['${key}'].resource_url`);
            if (result && typeof result === 'object') {
              // Check all URL fields
              const urlFields = [
                'video_resource_url',
                'resource_url',
                'video_url',
                'url',
                'video_file_url',
                'file_url',
                'output_url',
                'download_url',
                'media_url',
                'video_link',
                'link',
                'download_link',
                'media_link',
                'video_download_url'
              ];
              
              for (const field of urlFields) {
                if (result[field]) {
                  videoUrl = result[field];
                  debugInfo.videoUrlFound = true;
                  console.log(`Found video URL in ${key}.${field}:`, videoUrl);
                  break;
                }
              }
              if (videoUrl) break;
            }
          }
        }
        
        // Method 4: Deep scan for any URL-like strings
        if (!videoUrl) {
          const deepScan = (obj, path = '') => {
            if (typeof obj === 'string') {
              // Look for URLs that contain video-related keywords
              if (obj.includes('http') && 
                  (obj.includes('video') || obj.includes('mp4') || obj.includes('avi') || 
                   obj.includes('mov') || obj.includes('webm') || obj.includes('amazon') || 
                   obj.includes('cloudfront') || obj.includes('s3'))) {
                console.log(`Potential video URL found at ${path}:`, obj);
                return obj;
              }
            }
            if (obj && typeof obj === 'object') {
              for (const [key, value] of Object.entries(obj)) {
                const found = deepScan(value, path ? `${path}.${key}` : key);
                if (found) return found;
              }
            }
            return null;
          };
          
          videoUrl = deepScan(data.results);
          if (videoUrl) {
            debugInfo.videoUrlFound = true;
            console.log('Found video URL in deep scan:', videoUrl);
          }
        }
      }

      // Method 5: Check if URL is in top-level response
      if (!videoUrl) {
        const topLevelFields = ['video_url', 'resource_url', 'url', 'video_file_url', 'download_url'];
        for (const field of topLevelFields) {
          debugInfo.searchPaths.push(`data.${field}`);
          if (data[field]) {
            videoUrl = data[field];
            debugInfo.videoUrlFound = true;
            console.log(`Found video URL in top-level field '${field}':`, videoUrl);
            break;
          }
        }
      }

      console.log('=== URL EXTRACTION DEBUG ===');
      console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));
      console.log('Final Video URL:', videoUrl);
      console.log('=== END DEBUG ===');

      if (videoUrl) {
        return res.status(200).json({
          success: true,
          publicId: publicId,
          status: 'completed',
          videoUrl: videoUrl,
          videoData: data,
          debugInfo: debugInfo
        });
      } else {
        return res.status(200).json({
          success: true,
          publicId: publicId,
          status: 'finished',
          videoUrl: null,
          videoData: data,
          debugInfo: debugInfo
        });
      }
    }

    // Handle error status
    if (data.status === 'error' || data.error) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: data.error || 'Video generation failed',
        publicId: publicId
      });
    }

    // Unknown status
    return res.status(200).json({
      success: true,
      status: data.status || 'unknown',
      message: `Video status: ${data.status}`,
      publicId: publicId,
      lastChecked: new Date().toLocaleTimeString()
    });

  } catch (error) {
    console.error('Retrieve video error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve video status',
      details: error.message 
    });
  }
}
