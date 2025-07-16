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

    // Get API key from environment or use provided key
    const apiKey = process.env.SYNTHESIA_API_KEY || 'd089029706b0a8294a9697a72a7427da';
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Synthesia API key not configured' });
    }

    console.log('Checking Synthesia video status for ID:', videoId);

    // Check video status via Synthesia API
    const response = await fetch(`https://api.synthesia.io/v2/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Synthesia status check error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to check video status',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('Synthesia video status:', result);

    // Map Synthesia status to our format
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
        message = 'Generating AI avatar video... This may take 3-5 minutes';
        progress = 50;
        break;
      case 'failed':
        status = 'failed';
        message = 'AI avatar video generation failed';
        progress = 0;
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
      avatar: result.avatar || 'sonia_costume1_cameraA',
      voice: result.voice || 'en-US-JennyNeural',
      duration: result.duration || 'Unknown',
      createdAt: result.createdAt,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking Synthesia video status:', error);
    return res.status(500).json({ 
      error: 'Failed to check video status',
      details: error.message,
      errorType: error.constructor.name
    });
  }
}

