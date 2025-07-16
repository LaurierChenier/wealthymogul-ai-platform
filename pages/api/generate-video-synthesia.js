// Synthesia AI Avatar Video Generation API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script, duration = 120, platform = 'youtube' } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
    }

    const apiKey = process.env.SYNTHESIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Synthesia API key not configured' });
    }

    // Minimal working configuration
    const videoConfig = {
      input_text: script,
      avatar: 'anna_costume1_cameraA'
    };

    console.log('Creating Synthesia video with config:', videoConfig);

    // Create video via Synthesia API
    const response = await fetch('https://api.synthesia.io/v2/videos', {
      method: 'POST',
      headers: {
        'Authorization': `${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoConfig)
    });

    const responseText = await response.text();
    console.log('Synthesia response:', response.status, responseText);

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to create video',
        details: responseText 
      });
    }

    const result = JSON.parse(responseText);

    return res.status(200).json({
      success: true,
      videoId: result.id,
      status: 'pending',
      message: `${platform === 'youtube' ? '2-minute' : '30-second'} AI avatar video generation started`,
      provider: 'synthesia',
      platform: platform,
      estimatedTime: '3-5 minutes'
    });

  } catch (error) {
    console.error('Error in Synthesia video generation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate AI avatar video',
      details: error.message
    });
  }
}
