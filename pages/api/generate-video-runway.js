import RunwayML from '@runwayml/sdk';

// Runway ML Video Generation API using official SDK
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

    // Initialize Runway ML SDK with your existing API key
    const client = new RunwayML({
      apiKey: apiKey
    });

    // Prepare the prompt for video generation
    const prompt = `${title}: ${script}`.substring(0, 300);

    console.log('Starting Runway ML video generation with SDK:', prompt);
    console.log('API Key configured:', apiKey ? 'Yes' : 'No');

    // Use SDK for 30-second professional video generation
    const task = await client.imageToVideo.create({
      model: 'gen3a_turbo',
      promptImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop', // Neutral placeholder
      promptText: prompt,
      duration: 30,  // Updated from 10 to 30 seconds for true professional videos
      ratio: '1280:768'
    });

    console.log('Runway ML SDK response:', task);

    // Return the task ID for status checking
    return res.status(200).json({
      success: true,
      taskId: task.id,
      status: 'PENDING',
      message: 'Professional 30-second video generation started successfully using SDK',
      provider: 'runway',
      duration: 30
    });

  } catch (error) {
    console.error('Runway ML SDK error:', error);
    
    // Enhanced error handling for SDK
    return res.status(500).json({ 
      error: 'Failed to generate professional video',
      details: error.message,
      sdk_error: true,
      api_key_configured: !!process.env.RUNWAYML_API_SECRET,
      api_key_length: process.env.RUNWAYML_API_SECRET ? process.env.RUNWAYML_API_SECRET.length : 0
    });
  }
}
# Updated Sun Jul 14 17:29:08 UTC 2025
