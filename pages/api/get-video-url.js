export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.query;

  if (!publicId) {
    return res.status(400).json({ error: 'publicId is required' });
  }

  try {
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

    if (data.status === 'processing') {
      return res.status(200).json({
        success: true,
        status: 'processing',
        message: 'Video is still being generated. Please wait and try again.',
        publicId: publicId,
        lastChecked: new Date().toLocaleTimeString()
      });
    }

    if (data.status === 'success' || data.status === 'completed' || data.status === 'finished') {
      let videoUrl = null;
      
      // Extract video URL from Eden AI response
      if (data.results && data.results['amazon/amazon.nova-reel-v1:0'] && data.results['amazon/amazon.nova-reel-v1:0'].video_resource_url) {
        videoUrl = data.results['amazon/amazon.nova-reel-v1:0'].video_resource_url;
      }

      return res.status(200).json({
        success: true,
        publicId: publicId,
        status: 'completed',
        videoUrl: videoUrl,
        videoData: data,
        extractionMethod: "data.results['amazon/amazon.nova-reel-v1:0'].video_resource_url"
      });
    }

    return res.status(200).json({
      success: true,
      status: data.status || 'unknown',
      message: `Video status: ${data.status}`,
      publicId: publicId
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
