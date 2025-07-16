export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const apiKey = process.env.SYNTHESIA_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Synthesia API key not configured' });
    }

    const response = await fetch(`https://api.synthesia.io/v2/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(200).json({
          success: true,
          status: 'failed',
          message: 'Video was rejected by content moderation - try adjusting your script to avoid financial advice',
          videoUrl: null,
          provider: 'synthesia',
          videoId: videoId,
          error: 'Content moderation rejection'
        });
      }
      
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: 'Failed to check video status',
        details: errorText 
      });
    }

    const result = await response.json();

    let mappedStatus = 'processing';
    let message = 'Processing video...';
    let videoUrl = null;

    switch (result.status) {
      case 'complete':
        mappedStatus = 'succeeded';
        message = 'AI avatar video generated successfully!';
        videoUrl = result.download_url || result.video_url;
        break;
      case 'in_progress':
        mappedStatus = 'processing';
        message = 'Generating AI avatar video... This may take 3-5 minutes';
        break;
      case 'failed':
      case 'rejected':
      case 'moderated':
        mappedStatus = 'failed';
        message = 'Video was rejected by content moderation. Try avoiding financial advice or investment terms.';
        break;
      default:
        mappedStatus = 'processing';
        message = `Video status: ${result.status}`;
    }

    return res.status(200).json({
      success: true,
      status: mappedStatus,
      message: message,
      videoUrl: videoUrl,
      provider: 'synthesia',
      videoId: videoId,
      progress: result.progress || 'Unknown',
      createdAt: result.created_at,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to check video status',
      details: error.message
    });
  }
}
