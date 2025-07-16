// Synthesia AI Avatar Video Generation API
export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script, duration = 120, platform = 'youtube' } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
    }

    // Get API key from environment
    const apiKey = process.env.SYNTHESIA_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Synthesia API key not configured' });
    }

    // Choose avatar and voice based on platform
    const avatarConfig = {
      avatar: 'sonia_costume1_cameraA',
      voice: 'en-US-JennyNeural'
    };

    // Prepare video configuration with correct Synthesia v2 API structure
    const videoConfig = {
      title: title,
      input: [
        {
          scriptText: script,
          avatar: avatarConfig.avatar,
          background: 'white'
        }
      ],
      visibility: 'public'
    };

    console.log('Creating Synthesia video with config:', {
      title,
      duration,
      platform,
      avatar: avatarConfig.avatar,
      scriptLength: script.length
    });

    // Create video via Synthesia API
    const response = await fetch('https://api.synthesia.io/v2/videos', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Synthesia API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to create video',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('Synthesia video created:', result);

    // Return the video ID for status checking
    return res.status(200).json({
      success: true,
      videoId: result.id,
      status: 'pending',
      message: `${platform === 'youtube' ? '2-minute' : '30-second'} AI avatar video generation started`,
      provider: 'synthesia',
      platform: platform,
      avatar: avatarConfig.avatar,
      voice: avatarConfig.voice,
      estimatedTime: '3-5 minutes'
    });

  } catch (error) {
    console.error('Error in Synthesia video generation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate AI avatar video',
      details: error.message,
      errorType: error.constructor.name
    });
  }
}
