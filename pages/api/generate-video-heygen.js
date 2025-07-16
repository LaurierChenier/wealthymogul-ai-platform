// HeyGen API with Mason, Laurier, and Daisy custom avatars
export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  console.log('Request body:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script, duration = 120, platform = 'youtube', avatar = 'daisy_wealth_mogul' } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    console.log('API key exists:', !!apiKey);
    
    if (!apiKey) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    // HeyGen avatar mapping with your custom Wealthy Mogul avatars
    const avatarMapping = {
      // Your custom Wealthy Mogul team
      'daisy_wealth_mogul': 'cd32608c9c894f9a845e24e73e5c2734',
      'laurier_wealth_mogul': '35afd362145948ba8698d3279a249f3c',
      'mason_wealth_mogul': 'e44b3915d46144f3ae8f8226cf183ebe',
      
      // Backup HeyGen stock avatars
      'sonia_costume1_cameraA': 'Lina_Dress_Sitting_Side_public',
      'anna_costume1_cameraA': 'Angela-inblackskirt-20220820',
      'emma_costume1_cameraA': 'Abigail-PublicAvatar-20221210',
      'lisa_costume1_cameraA': 'Gala-PublicAvatar-20221210',
      'sarah_costume1_cameraA': 'Milena-PublicAvatar-20221210',
      'matthew_costume1_cameraA': 'Richard-PublicAvatar-20221210',
      'mike_costume1_cameraA': 'James-PublicAvatar-20221210',
      'david_costume1_cameraA': 'David-PublicAvatar-20221210',
      'james_costume1_cameraA': 'Eric-PublicAvatar-20221210',
      'alex_costume1_cameraA': 'John-PublicAvatar-20221210'
    };

    const heygenAvatar = avatarMapping[avatar] || 'cd32608c9c894f9a845e24e73e5c2734';
    console.log('Selected avatar:', avatar, '-> HeyGen ID:', heygenAvatar);

    // Voice selection (using default for now)
    const voiceId = '119caed25533477ba63822d5d1552d25';

    // Platform-specific script processing
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

    console.log('Creating HeyGen video with config:', {
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
        details: errorText,
        debug: {
          avatar: heygenAvatar,
          scriptLength: processedScript.length,
          platform,
          duration
        }
      });
    }

    const result = await response.json();
    console.log('HeyGen video created successfully:', result);

    return res.status(200).json({
      success: true,
      videoId: result.data.video_id,
      status: 'pending',
      message: `${platform === 'youtube' ? `${duration/60}-minute` : `${duration}-second`} AI avatar video generation started`,
      provider: 'heygen',
      platform: platform,
      duration: duration,
      avatar: heygenAvatar,
      avatarName: avatar,
      voice: voiceId,
      estimatedTime: '2-3 minutes'
    });

  } catch (error) {
    console.error('Error in HeyGen video generation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate AI avatar video',
      details: error.message,
      debug: {
        avatar: req.body?.avatar,
        scriptLength: req.body?.script?.length
      }
    });
  }
}
