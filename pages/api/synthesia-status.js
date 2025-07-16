// Synthesia Video Status Check API
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
        'Authorization': `${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to check video status',
        details: responseText 
      });
    }

    const result = JSON.parse(responseText);

    let status = 'pending';
    let message = 'Processing AI avatar video...';
    let videoUrl = null;
    let progress = 0;

    switch (result.status) {
      case 'complete':
        status = 'succeeded';
        message = 'AI avatar video generated successfully!';
        videoUrl = result.download;
        progress = 100;
        break;
      case 'in_progress':
        status = 'processing';
        message = 'Generating AI avatar video...';
        progress = 50;
        break;
      case 'failed':
        status = 'failed';
        message = 'AI avatar video generation failed';
        break;
      default:
        status = 'pending';
        message = 'AI avatar video queued for processing';
        progress = 10;
    }

    return res.status(200).json({
      success: true,
      status: status,
      videoUrl: videoUrl,
      message: message,
      provider: 'synthesia',
      videoId: videoId,
      progress: progress,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking Synthesia video status:', error);
    return res.status(500).json({ 
      error: 'Failed to check video status',
      details: error.message
    });
  }
}
