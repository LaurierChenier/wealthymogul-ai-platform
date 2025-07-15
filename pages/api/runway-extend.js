import RunwayML from '@runwayml/sdk';

// Runway ML Video Extension API using direct API calls
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

    // Create contextual prompt for each extension stage
    const extensionPrompts = {
      2: `Continue the real estate education scene naturally, maintaining visual consistency. ${originalPrompt || 'Focus on wealth building and real estate investing concepts.'}`,
      3: `Develop the educational narrative further, building on the established real estate theme. ${originalPrompt || 'Show progression in real estate investment concepts.'}`,
      4: `Conclude the real estate education sequence smoothly, bringing the story to a natural ending. ${originalPrompt || 'End with successful real estate investment outcomes.'}`
    };

    const prompt = extensionPrompts[stage] || `Continue the real estate education video sequence. ${originalPrompt || 'Focus on wealth building through real estate.'}`;

    console.log(`Starting Runway ML video extension - Stage ${stage} with asset ID:`, assetId);
    console.log('Extension prompt:', prompt);

    // Use direct API call to extend the video
    const response = await fetch('https://api.runwayml.com/v1/gen3/extend', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        assetId: assetId,
        text_prompt: prompt,
        seconds: 10, // Extension duration (5 or 10 seconds)
        seed: Math.floor(Math.random() * 4294967295),
        exploreMode: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Runway ML extension API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to start video extension',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('Runway ML extension task created:', result);

    // Calculate progress based on stage
    const progressMap = {
      2: 50,  // Stage 2 = 50% (base + 1 extension)
      3: 75,  // Stage 3 = 75% (base + 2 extensions)
      4: 100  // Stage 4 = 100% (base + 3 extensions = 34+ seconds)
    };

    // Return the task ID for status checking
    return res.status(200).json({
      success: true,
      taskId: result.taskId,
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
