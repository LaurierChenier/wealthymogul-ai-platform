import RunwayML from '@runwayml/sdk';

// Runway ML Video Extension API using official SDK
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { assetId, stage, originalPrompt, previousVideoUrl } = req.body;
    
    if (!assetId || !stage) {
      return res.status(400).json({ error: 'Asset ID and stage are required' });
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

    // Create contextual prompt for each extension stage
    const extensionPrompts = {
      2: `Continue the real estate education scene naturally, maintaining visual consistency. ${originalPrompt || 'Focus on wealth building and real estate investing concepts.'}`,
      3: `Develop the educational narrative further, building on the established real estate theme. ${originalPrompt || 'Show progression in real estate investment concepts.'}`,
      4: `Conclude the real estate education sequence smoothly, bringing the story to a natural ending. ${originalPrompt || 'End with successful real estate investment outcomes.'}`
    };

    const prompt = extensionPrompts[stage] || `Continue the real estate education video sequence. ${originalPrompt || 'Focus on wealth building through real estate.'}`;

    console.log(`Starting Runway ML video extension - Stage ${stage} with asset ID:`, assetId);
    console.log('Extension prompt:', prompt);

    // Create extension task using the asset ID from the previous video
    const extensionTask = await client.imageToVideo.extend({
      assetId: assetId,
      promptText: prompt,
      seed: Math.floor(Math.random() * 4294967295),
    });

    console.log('Runway ML extension task created:', extensionTask);

    // Calculate progress based on stage
    const progressMap = {
      2: 50,  // Stage 2 = 50% (base + 1 extension)
      3: 75,  // Stage 3 = 75% (base + 2 extensions)
      4: 100  // Stage 4 = 100% (base + 3 extensions = 34 seconds)
    };

    // Return the task ID for status checking
    return res.status(200).json({
      success: true,
      taskId: extensionTask.id,
      status: 'PENDING',
      message: `Video extension stage ${stage}/4 started successfully`,
      provider: 'runway',
      stage: stage,
      currentStage: stage,
      totalStages: 4,
      shouldExtend: stage < 4, // Continue extending until stage 4
      nextStage: stage + 1,
      progress: progressMap[stage] || 0,
      previousVideoUrl: previousVideoUrl,
      originalAssetId: assetId
    });

  } catch (error) {
    console.error('Error in Runway ML video extension:', error);
    return res.status(500).json({ 
      error: 'Failed to extend professional video',
      details: error.message,
      errorType: error.constructor.name
    });
  }
}
