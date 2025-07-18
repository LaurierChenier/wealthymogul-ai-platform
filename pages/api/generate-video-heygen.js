export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script, duration = 120, platform = 'youtube', avatar = 'daisy_wealth_mogul' } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    // Simple avatar mapping that works
    const avatarMapping = {
      'daisy_wealth_mogul': 'ae573c3333854730a9077d80b53d97e5',
      'laurier_wealth_mogul': '7f7b982477074c11b8593d0c60690f0a',
      'mason_wealth_mogul': 'f379aa769b474121a59c128ebdcee2ad',
    };

    const heygenAvatar = avatarMapping[avatar] || avatarMapping['daisy_wealth_mogul'];
    
    // Voice selection
    let voiceId = 'f8c69e517f424cafaecde32dde57096b'; // Female default
    if (avatar.includes('laurier')) {
      voiceId = '897d6a9b2c844f56aa077238768fe10a';
    } else if (avatar.includes('mason')) {
      voiceId = '5d8c378ba8c3434586081a52ac368738';
    }

    const videoConfig = {
      video_inputs: [{
        character: {
          type: 'talking_photo',
          talking_photo_id: heygenAvatar,
          talking_photo_style: 'square',
          talking_style: 'stable',
          expression: 'default'
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: voiceId,
          speed: 1.0
        }
      }],
      dimension: {
        width: platform === 'instagram' ? 720 : 1280,
        height: platform === 'instagram' ? 1280 : 720
      },
      test: false,
      caption: true,
      title: title
    };

    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoConfig)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: responseData.error || 'HeyGen API request failed'
      });
    }

    return res.status(200).json({
      success: true,
      videoId: responseData.data.video_id,
      status: 'processing',
      provider: 'heygen',
      platform,
      duration,
      avatar,
      title,
      message: 'Video generation started successfully'
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
