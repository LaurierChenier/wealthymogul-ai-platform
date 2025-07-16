// Synthesia Video Status Check API with Moderation Handling
export default async function handler(req, res) {
  console.log('Synthesia status check called');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Get API key from environment
    const apiKey = process.env.SYNTHESIA_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Synthesia API key not configured' });
    }

    console.log('Checking video status for:', videoId);

    // Check video status via Synthesia API
    const response = await fetch(`https://api.synthesia.io/v2/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('Synthesia API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Synthesia API error:', response.status, errorText);
      
      // Handle different error cases
      if (response.status === 404) {
        return res.status(200).json({
          success: true,
          status: 'failed',
          message: 'Video not found - may have been rejected by content moderation',
          videoUrl: null,
          provider: 'synthesia',
          videoId: videoId,
          error: 'Video was likely rejected during content moderation process'
        });
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to check video status',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('Video status result:', result);

    // Map Synthesia status to our application status
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
        mappedStatus = 'failed';
        message = 'Video generation failed';
        break;
      case 'rejected':
      case 'moderated':
        mappedStatus = 'failed';
        message = 'Video was rejected by content moderation. Try adjusting your script to avoid financial advice or investment recommendations.';
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
      lastUpdated: new Date().toISOString(),
      rawStatus: result.status,
      moderationInfo: result.moderation_reason || null
    });

  } catch (error) {
    console.error('Error in Synthesia status check:', error);
    return res.status(500).json({ 
      error: 'Failed to check video status',
      details: error.message,
      errorType: error.constructor.name
    });
  }
}
