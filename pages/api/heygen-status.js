export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    console.log('🔍 Checking HeyGen status for video:', videoId);

    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    const responseData = await response.json();
    
    console.log('📥 HeyGen Status Response:', {
      status: response.status,
      data: responseData,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      console.error('❌ HeyGen Status API Error:', responseData);
      return res.status(response.status).json({ 
        error: responseData.error || 'HeyGen status check failed',
        details: responseData 
      });
    }

    if (responseData.error) {
      return res.status(400).json({ 
        error: responseData.error.message || 'HeyGen status error',
        details: responseData.error 
      });
    }

    // Map HeyGen status to our internal format
    const heygenStatus = responseData.data.status;
    let internalStatus = 'processing';
    let videoUrl = null;

    switch (heygenStatus) {
      case 'completed':
        internalStatus = 'completed';
        videoUrl = responseData.data.video_url;
        break;
      case 'processing':
        internalStatus = 'processing';
        break;
      case 'failed':
        internalStatus = 'failed';
        break;
      case 'pending':
        internalStatus = 'pending';
        break;
      default:
        internalStatus = 'processing';
    }

    // Success response
    return res.status(200).json({
      success: true,
      videoId,
      status: internalStatus,
      videoUrl,
      provider: 'heygen',
      heygenStatus,
      lastChecked: new Date().toISOString(),
      message: internalStatus === 'completed' ? 'Video is ready!' : 
               internalStatus === 'failed' ? 'Video generation failed' : 
               'Video is still processing...'
    });

  } catch (error) {
    console.error('💥 HeyGen Status Handler Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

