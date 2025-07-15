import RunwayML from '@runwayml/sdk';

// Runway ML Status Check API with automatic extension management
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

    // Initialize Runway ML client
    const client = new RunwayML({
      apiKey: apiKey,
    });

    console.log('Checking Runway ML status for task:', taskId);

    // Retrieve task status using official SDK
    const task = await client.tasks.retrieve(taskId);
    console.log('Runway ML task status:', task);

    // Extract status and video URL
    const status = task.status;
    let videoUrl = null;
    let message = 'Processing professional video...';
    let shouldExtend = false;
    let nextStage = 1;
    let currentStage = 1;
    let totalStages = 4;

    if (status === 'SUCCEEDED') {
      // Extract video URL from output array
      if (task.output && task.output.length > 0) {
        videoUrl = task.output[0];
        
        // Check if this is a base video (needs extension) or final video
        // We'll determine this by checking if we have metadata about the stage
        // For now, assume base video needs extension
        shouldExtend = true;
        nextStage = 2;
        currentStage = 1;
        message = 'Stage 1/4 completed! Preparing stage 2...';
        
        // Auto-trigger next extension stage
        console.log('Base video completed, triggering stage 2 extension...');
        
        try {
          // Extract asset ID from the task or video URL
          const assetId = task.id; // Use task ID as asset ID
          
          // Call extension API
          const extensionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://wealthymogul-ai-platform-v2.vercel.app'}/api/runway-extend`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              assetId: assetId,
              stage: 2,
              originalPrompt: 'Continue the real estate education scene naturally',
              previousVideoUrl: videoUrl
            })
          });
          
          if (extensionResponse.ok) {
            const extensionResult = await extensionResponse.json();
            console.log('Extension stage 2 triggered:', extensionResult);
            
            // Update response to show extension is in progress
            return res.status(200).json({
              success: true,
              status: 'processing',
              videoUrl: videoUrl,
              message: 'Stage 1/4 completed! Stage 2 extension in progress...',
              provider: 'runway',
              taskId: extensionResult.taskId,
              progress: 25,
              currentStage: 2,
              totalStages: 4,
              shouldExtend: true,
              nextStage: 3,
              baseVideoUrl: videoUrl
            });
          } else {
            console.error('Failed to trigger extension:', await extensionResponse.text());
            message = 'Stage 1/4 completed! Extension failed - video ready for download';
            shouldExtend = false;
          }
        } catch (extensionError) {
          console.error('Error triggering extension:', extensionError);
          message = 'Stage 1/4 completed! Extension error - video ready for download';
          shouldExtend = false;
        }
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
      progress: status === 'SUCCEEDED' ? 25 : (task.progress || 0),
      estimatedTimeRemaining: task.estimatedTimeRemaining || null,
      currentStage: currentStage,
      totalStages: totalStages,
      shouldExtend: shouldExtend,
      nextStage: nextStage
    });

  } catch (error) {
    console.error('Error checking Runway ML status:', error);
    return res.status(500).json({ 
      error: 'Failed to check video status',
      details: error.message,
      errorType: error.constructor.name
    });
  }
}
