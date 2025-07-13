export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({ error: 'Public ID is required' });
  }

  try {
    console.log('Retrieving video with public ID:', publicId);
    
    // Call Eden AI Video Retrieval API
    const response = await fetch(`https://api.edenai.run/v2/video/generation_async/${publicId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`,
      }
    });

    const responseText = await response.text();
    console.log('Eden AI Retrieval Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Eden AI Retrieval Data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON response from Eden AI retrieval',
        responseText: responseText.substring(0, 1000),
        status: response.status
      });
    }

    if (!response.ok) {
      throw new Error(`Eden AI retrieval error: ${response.status} - ${data.detail || data.message || 'Unknown error'}`);
    }

    // Extract video URL from Amazon Nova Reel response - FIXED
    let videoUrl = null;
    
    // Try multiple possible URL locations in the response
    if (data.results && data.results.amazon) {
      videoUrl = data.results.amazon.resource_url || 
                 data.results.amazon.video_url ||
                 data.results.amazon.url;
    } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      videoUrl = data.results[0].resource_url || 
                 data.results[0].video_url ||
                 data.results[0].url;
    } else if (data.video_url) {
      videoUrl = data.video_url;
    } else if (data.resource_url) {
      videoUrl = data.resource_url;
    }

    // Return video retrieval result
    const result = {
      success: true,
      publicId: publicId,
      status: data.status || 'unknown',
      videoUrl: videoUrl,
      videoData: data,
      retrievedAt: new Date().toISOString(),
      provider: 'eden-ai',
      amazonResponse: data.results?.amazon || data.results?.[0] || null,
      debugInfo: {
        hasResults: !!data.results,
        hasAmazonResults: !!(data.results && data.results.amazon),
        videoUrlFound: !!videoUrl,
        searchPaths: [
          'data.results.amazon.resource_url',
          'data.results.amazon.video_url', 
          'data.results[0].resource_url',
          'data.video_url',
          'data.resource_url'
        ]
      }
    };

    console.log('Video retrieval result:', JSON.stringify(result, null, 2));
    res.status(200).json(result);

  } catch (error) {
    console.error('Video retrieval error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      hasApiKey: !!process.env.EDEN_AI_API_KEY
    });
  }
}
