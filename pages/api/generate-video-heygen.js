// HeyGen AI Avatar Video Generation API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script, duration = 120, platform = 'youtube', avatar = 'Lina_Dress_Sitting_Side_public' } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    // HeyGen avatar mapping for professional female avatars
    const avatarMapping = {
      'sonia_costume1_cameraA': 'Lina_Dress_Sitting_Side_public',
      'anna_costume1_cameraA': 'Angela-inblackskirt-20220820',
      'emma_costume1_cameraA': 'Abigail-PublicAvatar-20221210',
      'lisa_costume1_cameraA': 'Gala-PublicAvatar-20221210',
      'sarah_costume1_cameraA': 'Milena-PublicAvatar-20221210',
      'matthew_costume1_cameraA': 'Richard-PublicAvatar-20221210',
      'mike_costume1_cameraA': 'James-PublicAvatar-20221210',
      'david_costume1_cameraA': 'David-PublicAvatar-20221210',
      'james_costume1_cameraA': 'Eric-PublicAvatar-20221210',
      'alex_costume1_cameraA': 'John-PublicAvatar-20221210',
      'priya_costume1_cameraA': 'Lindiwe-PublicAvatar-20221210',
      'carlos_costume1_cameraA': 'Carlos-PublicAvatar-20221210',
      'nina_costume1_cameraA': 'Nina-PublicAvatar-20221210',
      'ryan_costume1_cameraA': 'Ryan-PublicAvatar-20221210'
    };

    const heygenAvatar = avatarMapping[avatar] || 'Lina_Dress_Sitting_Side_public';

    // Voice selection based on avatar gender
    const voiceMapping = {
      'Lina_Dress_Sitting_Side_public': '119caed25533477ba63822d5d1552d25', // Female voice
      'Angela-inblackskirt-20220820': '119caed25533477ba63822d5d1552d25',
      'Abigail-PublicAvatar-20221210': '119caed25533477ba63822d5d1552d25',
      'Gala-PublicAvatar-20221210': '119caed25533477ba63822d5d1552d25',
      'Milena-PublicAvatar-20221210': '119caed25533477ba63822d5d1552d25',
      'Richard-PublicAvatar-20221210': '2d5b0e6c8b6d4a5c9e8f7d3c4b2a1e5d', // Male voice
      'James-PublicAvatar-20221210': '2d5b0e6c8b6d4a5c9e8f7d3c4b2a1e5d',
      'David-PublicAvatar-20221210': '2d5b0e6c8b6d4a5c9e8f7d3c4b2a1e5d',
      'Eric-PublicAvatar-20221210': '2d5b0e6c8b6d4a5c9e8f7d3c4b2a1e5d',
      'John-PublicAvatar-20221210': '2d5b0e6c8b6d4a5c9e8f7d3c4b2a1e5d',
      'Lindiwe-PublicAvatar-20221210': '119caed25533477ba63822d5d1552d25',
      'Carlos-PublicAvatar-20221210': '2d5b0e6c8b6d4a5c9e8f7d3c4b2a1e5d',
      'Nina-PublicAvatar-20221210': '119caed25533477ba63822d5d1552d25',
      'Ryan-PublicAvatar-20221210': '2d5b0e6c8b6d4a5c9e8f7d3c4b2a1e5d'
    };

    const voiceId = voiceMapping[heygenAvatar] || '119caed25533477ba63822d5d1552d25';

    // Platform-specific processing
    let processedScript = script;
    if (platform === 'youtube') {
      const maxLength = duration <= 120 ? 500 : duration <= 180 ? 750 : 1000;
      processedScript = script.substring(0, maxLength);
    } else if (platform === 'instagram') {
      const maxLength = duration === 30 ? 250 : 500;
      processedScript = script.substring(0, maxLength);
    }

    // HeyGen video configuration
    const videoConfig = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: heygenAvatar,
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: processedScript,
            voice_id: voiceId,
            speed: 1.0
          }
        }
      ],
      dimension: {
        width: platform === 'instagram' ? 720 : 1280,
        height: platform === 'instagram' ? 1280 : 720
      },
      test: false,
      caption: false
    };

    console.log('Creating HeyGen video:', {
      title,
      avatar: heygenAvatar,
      voiceId,
      scriptLength: processedScript.length,
      platform,
      duration
    });

    // Create video via HeyGen API
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to create video',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('HeyGen video created:', result);

    return res.status(200).json({
      success: true,
      videoId: result.data.video_id,
      status: 'pending',
      message: `${platform === 'youtube' ? `${duration/60}-minute` : `${duration}-second`} AI avatar video generation started`,
      provider: 'heygen',
      platform: platform,
      duration: duration,
      avatar: heygenAvatar,
      voice: voiceId,
      estimatedTime: '2-3 minutes'
    });

  } catch (error) {
    console.error('Error in HeyGen video generation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate AI avatar video',
      details: error.message
    });
  }
}
