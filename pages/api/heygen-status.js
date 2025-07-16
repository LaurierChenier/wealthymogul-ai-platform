// HeyGen Video Status Check API
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

    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: 'Failed to check video status',
        details: errorText 
      });
    }

    const result = await response.json();

    // Map HeyGen status to our application status
    let mappedStatus = 'processing';
    let message = 'Processing video...';
    let videoUrl = null;

    switch (result.data.status) {
      case 'completed':
        mappedStatus = 'succeeded';
        message = 'AI avatar video generated successfully!';
        videoUrl = result.data.video_url;
        break;
      case 'processing':
        mappedStatus = 'processing';
        message = 'Generating AI avatar video... This may take 2-3 minutes';
        break;
      case 'failed':
        mappedStatus = 'failed';
        message = 'Video generation failed';
        break;
      case 'pending':
        mappedStatus = 'pending';
        message = 'Video queued for processing';
        break;
      default:
        mappedStatus = 'processing';
        message = `Video status: ${result.data.status}`;
    }

    return res.status(200).json({
      success: true,
      status: mappedStatus,
      message: message,
      videoUrl: videoUrl,
      provider: 'heygen',
      videoId: videoId,
      progress: result.data.progress || 'Unknown',
      createdAt: result.data.created_at,
      lastUpdated: new Date().toISOString(),
      rawStatus: result.data.status
    });

  } catch (error) {
    console.error('Error in HeyGen status check:', error);
    return res.status(500).json({ 
      error: 'Failed to check video status',
      details: error.message
    });
  }
}
