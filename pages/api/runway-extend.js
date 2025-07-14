import RunwayML from '@runwayml/sdk';

// Runway ML Video Extension Management API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { assetId, stage, originalPrompt, originalTitle } = req.body;
    
    if (!assetId) {
      return res.status(400).json({ error: 'Asset ID is required' });
    }

    if (!stage || stage < 2 || stage > 4) {
      return res.status(400).json({ error: 'Invalid stage. Must be 2, 3, or 4' });
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

    console.log(`Extending video (stage ${stage}/4) with assetId:`, assetId);

    // Create continuation prompt based on stage
    const stagePrompts = {
      2: `Continuing ${originalTitle}: Building on previous concepts with advanced strategies`,
      3: `${originalTitle} continued: Implementing practical techniques and real-world examples`,
      4: `${originalTitle} conclusion: Summarizing key insights and actionable next steps`
    };

    const extensionPrompt = stagePrompts[stage] || originalPrompt;

    // Extend the video by 8 seconds
    const extensionTask = await client.imageToVideo.extend({
      assetId: assetId,
      seconds: 8,
      text_prompt: extensionPrompt,
      exploreMode: false
    });

    const stageDescriptions = {
      2: 'Extending to 18 seconds - Adding advanced content...',
      3: 'Extending to 26 seconds - Including practical examples...',
      4: 'Final extension to 34 seconds - Adding conclusion...'
    };

    const currentDuration = 10 + ((stage - 1) * 8);

    return res.status(200).json({
      success: true,
      taskId: extensionTask.id,
      status: 'PENDING',
      message: `Professional video extension stage ${stage}/4 started`,
      provider: 'runway',
      duration: currentDuration,
      stage: `extension_${stage}`,
      totalStages: 4,
      currentStage: stage,
      stageDescription: stageDescriptions[stage],
      originalPrompt: originalPrompt,
      originalTitle: originalTitle
    });

  } catch (error) {
    console.error('Runway ML extension error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to extend video',
      details: error.message,
      sdk_error: true,
      api_key_configured: !!process.env.RUNWAYML_API_SECRET
    });
  }
}
