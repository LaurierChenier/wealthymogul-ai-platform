import RunwayML from '@runwayml/sdk';

// Runway ML Status Check API using official SDK
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

    // Use SDK to retrieve task status
    const task = await client.tasks.retrieve(taskId);

    console.log('Runway ML SDK status response:', task);

    // Extract status and video URL
    const status = task.status;
    let videoUrl = null;
    let message = 'Processing professional video...';

    if (status === 'SUCCEEDED') {
      // Extract video URL from task output
      if (task.output && task.output.length > 0) {
        videoUrl = task.output[0];
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
      progress: task.progress || 0,
      sdk_response: task
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
