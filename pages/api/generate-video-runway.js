// Runway ML Video Generation API
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

    // Prepare the prompt for video generation
    const prompt = `${title}: ${script}`.substring(0, 300);

    console.log('Starting Runway ML video generation with prompt:', prompt);

    const requestBody = {
      model: "gen3a_turbo",
      promptText: prompt,
      seed: Math.floor(Math.random() * 4294967295),
      duration: 10,
      ratio: "1280:768"
    };

    // Use the actual latest supported API version (2024-11-06)
    const response = await fetch('https://api.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Runway ML API error:', response.status, responseText);
      return res.status(response.status).json({ 
        error: 'Failed to start video generation',
        details: `API returned ${response.status}: ${responseText}`,
        endpoint: 'https://api.runwayml.com/v1/image_to_video',
        requestBody: requestBody,
        api_key_configured: !!apiKey,
        api_key_length: apiKey ? apiKey.length : 0
      });
    }

    const result = JSON.parse(responseText);

    // Return the task ID for status checking
    return res.status(200).json({
      success: true,
      taskId: result.id,
      status: 'PENDING',
      message: 'Professional video generation started successfully',
      provider: 'runway'
    });

  } catch (error) {
    console.error('Error in Runway ML video generation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate professional video',
      details: error.message 
    });
  }
}
