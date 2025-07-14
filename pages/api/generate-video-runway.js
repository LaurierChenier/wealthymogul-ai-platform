import RunwayML from '@runwayml/sdk';

// Runway ML Video Generation API with automatic extension to 34 seconds
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
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

    // Prepare the prompt for video generation
    const prompt = `${title}: ${script}`.substring(0, 300);

    console.log('Starting Runway ML 34-second video generation with extensions:', prompt);

    // Step 1: Generate base 10-second video
    const baseTask = await client.imageToVideo.create({
      model: 'gen3a_turbo',
      promptImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
      promptText: prompt,
      duration: 10,
      ratio: '1280:768'
    });

    console.log('Base 10-second video task created:', baseTask);

    // Return the initial task info - extensions will be handled by status endpoint
    return res.status(200).json({
      success: true,
      taskId: baseTask.id,
      status: 'PENDING',
      message: 'Professional 34-second video generation started (10s base + 3 extensions)',
      provider: 'runway',
      duration: 34,
      stage: 'base_generation',
      totalStages: 4,
      currentStage: 1,
      stageDescription: 'Generating base 10-second video...',
      originalPrompt: prompt,
      originalTitle: title,
      originalScript: script
    });

  } catch (error) {
    console.error('Runway ML SDK error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to generate professional video',
      details: error.message,
      sdk_error: true,
      api_key_configured: !!process.env.RUNWAYML_API_SECRET
    });
  }
}
