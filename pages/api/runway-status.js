import RunwayML from '@runwayml/sdk';

// Enhanced Runway ML Status Check API with automatic extension management
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

    // Retrieve current task status
    const task = await client.tasks.retrieve(taskId);
    console.log('Runway ML SDK status response:', task);

    const status = task.status;
    let videoUrl = null;
    let message = 'Processing professional video...';
    let downloadReady = false;
    let shouldExtend = false;
    let nextStage = null;
    let assetId = null;

    if (status === 'SUCCEEDED') {
      // Extract video URL and asset ID
      if (task.output && task.output.length > 0) {
        videoUrl = task.output[0];
        downloadReady = true;
        
        // Extract asset ID for potential extension
        if (task.assetIds && task.assetIds.length > 0) {
          assetId = task.assetIds[0];
        }
        
        // Determine if we need to extend this video
        // Check if this is a base video (stage 1) or extension that needs more stages
        const currentStage = task.metadata?.currentStage || 1;
        
        if (currentStage < 4) {
          shouldExtend = true;
          nextStage = currentStage + 1;
          message = `Stage ${currentStage}/4 completed! Preparing stage ${nextStage}...`;
          downloadReady = false; // Don't show download until final video
        } else {
          message = 'Professional 34-second video generated successfully! Download link refreshed.';
        }
      } else {
        message = 'Video completed but no output found';
      }
    } else if (status === 'FAILED') {
      message = 'Professional video generation failed';
      if (task.failure) {
        console.error('Task failure details:', task.failure);
        message += ` - ${task.failure.reason || 'Unknown error'}`;
      }
    } else if (status === 'PENDING') {
      message = 'Video generation queued... Starting soon';
    } else if (status === 'RUNNING') {
      const progressPercent = task.progress ? Math.round(task.progress * 100) : 0;
      const currentStage = task.metadata?.currentStage || 1;
      message = `Stage ${currentStage}/4: Generating video... ${progressPercent}% complete`;
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
      shouldExtend: shouldExtend,
      nextStage: nextStage,
      assetId: assetId,
      currentStage: task.metadata?.currentStage || 1,
      totalStages: 4,
      sdk_response: {
        id: task.id,
        status: task.status,
        createdAt: task.createdAt,
        progress: task.progress,
        output: task.output,
        assetIds: task.assetIds
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
