// Runway ML Status Check API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taskId } = req.query;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // Get API key from environment
    const apiKey = process.env.RUNWAYML_API_SECRET;
    if (!apiKey) {
      return res.status(500).json({ error: 'Runway ML API key not configured' });
    }

    console.log('Checking Runway ML status for task:', taskId);

    // Make request to Runway ML API to check status using the correct endpoint
    const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Runway ML status check error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to check video status',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('Runway ML status response:', result);

    // Extract status and video URL
    const status = result.status;
    let videoUrl = null;
    let message = 'Processing professional video...';

    if (status === 'SUCCEEDED') {
      // Extract video URL from artifacts array
      if (result.artifacts && result.artifacts.length > 0) {
        videoUrl = result.artifacts[0].url;
        message = 'Professional video generated successfully!';
      } else {
        message = 'Video completed but no output found';
      }
    } else if (status === 'FAILED') {
      message = 'Professional video generation failed';
    } else if (status === 'PENDING' || status === 'RUNNING') {
      message = 'Generating professional video... This may take 3-5 minutes';
    }

    return res.status(200).json({
      success: true,
      status: status.toLowerCase(),
      videoUrl: videoUrl,
      message: message,
      provider: 'runway',
      taskId: taskId,
      progress: result.progress || 0
    });

  } catch (error) {
    console.error('Error checking Runway ML status:', error);
    return res.status(500).json({ 
      error: 'Failed to check video status',
      details: error.message 
    });
  }
}
