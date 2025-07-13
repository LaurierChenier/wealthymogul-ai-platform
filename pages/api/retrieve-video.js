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
    
    console.log('Eden AI Response:', JSON.stringify(data, null, 2));

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
      
      // FIXED: Use 'amazon' key instead of 'amazon/amazon.nova-reel-v1:0'
      if (data.results && data.results.amazon) {
        const amazonResult = data.results.amazon;
        console.log('Amazon result:', JSON.stringify(amazonResult, null, 2));
        
        // Check the correct field name
        videoUrl = amazonResult.video_resource_url || 
                  amazonResult.resource_url || 
                  amazonResult.video_url ||
                  amazonResult.url;
        
        console.log('Found video URL:', videoUrl);
      }

      return res.status(200).json({
        success: true,
        publicId: publicId,
        status: 'finished',
        videoUrl: videoUrl,
        videoData: data,
        debugInfo: {
          hasResults: !!data.results,
          hasAmazonResults: !!(data.results && data.results.amazon),
          videoUrlFound: !!videoUrl,
          amazonResultKeys: data.results && data.results.amazon ? Object.keys(data.results.amazon) : []
        }
      });
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
