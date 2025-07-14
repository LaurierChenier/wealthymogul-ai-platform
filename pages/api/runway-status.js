import RunwayML from '@runwayml/sdk';

// Enhanced Runway ML Status Check API with automatic fresh JWT token retrieval
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

    // Initialize Runway ML SDK
    const client = new RunwayML({
      apiKey: apiKey
    });

    console.log('Checking Runway ML status for task:', taskId);

    // Use SDK to retrieve FRESH task status (always gets new JWT tokens)
    const task = await client.tasks.retrieve(taskId);

    console.log('Runway ML SDK status response:', task);

    // Extract status and video URL
    const status = task.status;
    let videoUrl = null;
    let message = 'Processing professional video...';
    let downloadReady = false;

    if (status === 'SUCCEEDED') {
      // Extract video URL from task output (fresh JWT token)
      if (task.output && task.output.length > 0) {
        videoUrl = task.output[0]; // This will have a fresh JWT token
        message = 'Professional video generated successfully! Download link refreshed.';
        downloadReady = true;
      } else {
        message = 'Video completed but no output found';
      }
    } else if (status === 'FAILED') {
      message = 'Professional video generation failed';
      // Log failure reason if available
      if (task.failure) {
        console.error('Task failure details:', task.failure);
        message += ` - ${task.failure.reason || 'Unknown error'}`;
      }
    } else if (status === 'PENDING') {
      message = 'Video generation queued... Starting soon';
    } else if (status === 'RUNNING') {
      const progressPercent = task.progress ? Math.round(task.progress * 100) : 0;
      message = `Generating professional video... ${progressPercent}% complete (${3-Math.floor(progressPercent/35)} mins remaining)`;
    }

    return res.status(200).json({
      success: true,
      status: status.toLowerCase(),
      videoUrl: videoUrl,
      message: message,
      provider: 'runway',
      taskId: taskId,
      progress: task.progress || 0,
      downloadReady: downloadReady,
      freshTokenGenerated: !!videoUrl,
      lastUpdated: new Date().toISOString(),
      sdk_response: {
        id: task.id,
        status: task.status,
        createdAt: task.createdAt,
        progress: task.progress,
        output: task.output
      }
    });

  } catch (error) {
    console.error('Error checking Runway ML status with SDK:', error);
    return res.status(500).json({ 
      error: 'Failed to check video status',
      details: error.message,
      sdk_error: true,
      api_key_configured: !!process.env.RUNWAYML_API_SECRET
    });
  }
}
