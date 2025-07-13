export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.query;

  if (!publicId) {
    return res.status(400).json({ error: 'publicId is required' });
  }

  try {
    // Add proper parameters based on Eden AI documentation
    const url = new URL(`https://api.edenai.run/v2/video/generation_async/${publicId}/`);
    url.searchParams.append('response_as_dict', 'true');
    url.searchParams.append('show_base_64', 'false');
    url.searchParams.append('show_original_response', 'false');

    const response = await fetch(url.toString(), {
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
    if (data.status === 'success' || data.status === 'completed' || data.status === 'finished') {
      console.log('Video completed! Extracting video URL...');
      
      let videoUrl = null;
      let debugInfo = {
        hasAmazonResults: false,
        videoUrlFound: false,
        searchMethod: '',
        responseStructure: {}
      };
      
      // Store the response structure for debugging
      debugInfo.responseStructure = {
        status: data.status,
        hasAmazon: !!data.amazon,
        amazonKeys: data.amazon ? Object.keys(data.amazon) : [],
        fullResponseKeys: Object.keys(data)
      };
      
      // Method 1: Check data.amazon.video_url (latest documentation approach)
      if (data.amazon && data.amazon.video_url) {
        videoUrl = data.amazon.video_url;
        debugInfo.videoUrlFound = true;
        debugInfo.searchMethod = 'data.amazon.video_url';
        debugInfo.hasAmazonResults = true;
        console.log('Found video URL in data.amazon.video_url:', videoUrl);
      }
      
      // Method 2: Check data.amazon.resource_url as fallback
      if (!videoUrl && data.amazon && data.amazon.resource_url) {
        videoUrl = data.amazon.resource_url;
        debugInfo.videoUrlFound = true;
        debugInfo.searchMethod = 'data.amazon.resource_url';
        debugInfo.hasAmazonResults = true;
        console.log('Found video URL in data.amazon.resource_url:', videoUrl);
      }
      
      // Method 3: Check for any video URL in the amazon object
      if (!videoUrl && data.amazon) {
        debugInfo.hasAmazonResults = true;
        const amazonData = data.amazon;
        console.log('Amazon data keys:', Object.keys(amazonData));
        console.log('Amazon data content:', JSON.stringify(amazonData, null, 2));
        
        // Check all possible URL fields in amazon object
        const urlFields = [
          'video_url',
          'resource_url', 
          'video_resource_url',
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
          if (amazonData[field]) {
            videoUrl = amazonData[field];
            debugInfo.videoUrlFound = true;
            debugInfo.searchMethod = `data.amazon.${field}`;
            console.log(`Found video URL in data.amazon.${field}:`, videoUrl);
            break;
          }
        }
      }
      
      // Method 4: Check results structure if it exists (fallback for old API format)
      if (!videoUrl && data.results) {
        console.log('Checking results structure...');
        // Check amazon key in results
        if (data.results.amazon && data.results.amazon.video_url) {
          videoUrl = data.results.amazon.video_url;
          debugInfo.videoUrlFound = true;
          debugInfo.searchMethod = 'data.results.amazon.video_url';
          console.log('Found video URL in data.results.amazon.video_url:', videoUrl);
        }
        
        // Check amazon/amazon.nova-reel-v1:0 key
        const amazonKey = 'amazon/amazon.nova-reel-v1:0';
        if (!videoUrl && data.results[amazonKey]) {
          const amazonResult = data.results[amazonKey];
          console.log('Amazon nova reel result keys:', Object.keys(amazonResult));
          console.log('Amazon nova reel result content:', JSON.stringify(amazonResult, null, 2));
          
          // Check for video_url first
          if (amazonResult.video_url) {
            videoUrl = amazonResult.video_url;
            debugInfo.videoUrlFound = true;
            debugInfo.searchMethod = `data.results['${amazonKey}'].video_url`;
            console.log('Found video URL in amazon nova reel result:', videoUrl);
          }
          // Check for video_resource_url (actual field name in response)
          else if (amazonResult.video_resource_url) {
            videoUrl = amazonResult.video_resource_url;
            debugInfo.videoUrlFound = true;
            debugInfo.searchMethod = `data.results['${amazonKey}'].video_resource_url`;
            console.log('Found video resource URL in amazon nova reel result:', videoUrl);
          }
          // Check other possible URL fields
          else {
            const urlFields = [
              'resource_url', 
              'video_file_url',
              'file_url',
              'output_url',
              'download_url',
              'media_url',
              'video_link',
              'link',
              'url'
            ];
            
            for (const field of urlFields) {
              if (amazonResult[field]) {
                videoUrl = amazonResult[field];
                debugInfo.videoUrlFound = true;
                debugInfo.searchMethod = `data.results['${amazonKey}'].${field}`;
                console.log(`Found video URL in data.results['${amazonKey}'].${field}:`, videoUrl);
                break;
              }
            }
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
          message: 'Video generation completed but no video URL found in response',
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
