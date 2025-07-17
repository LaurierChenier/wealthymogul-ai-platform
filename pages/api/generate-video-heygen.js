export default async function handler(req, res) {
  // Debug logging
  console.log('🔍 HeyGen API Request:', {
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

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

    // Avatar mapping with YOUR ACTUAL CUSTOM AVATARS from HeyGen API
    const avatarMapping = {
      // Custom Wealthy Mogul avatars - YOUR ACTUAL TALKING PHOTO IDs
      'daisy_wealth_mogul': 'ae573c3333854730a9077d80b53d97e5',     // Daisy (talking photo)
      'laurier_wealth_mogul': '7f7b982477074c11b8593d0c60690f0a',   // Laurier (talking photo)
      'mason_wealth_mogul': 'f379aa769b474121a59c128ebdcee2ad',     // Mason (talking photo)
      
      // HeyGen stock avatars (fallback options)
      'female_professional_1': 'Angela-inblackskirt-20220820',
      'female_professional_2': 'Daisy-inskirt-20220818',
      'female_casual_1': 'Angela-inblackskirt-20220820',
      'female_casual_2': 'Daisy-inskirt-20220818',
      'male_professional_1': 'Josh_20230826_135716_image',
      'male_professional_2': 'Josh_20230826_135716_image',
      'male_casual_1': 'Josh_20230826_135716_image',
      'male_casual_2': 'Josh_20230826_135716_image'
    };

    const heygenAvatar = avatarMapping[avatar] || 'Angela-inblackskirt-20220820'; // Default to working stock avatar
    
    // Determine if this is a talking photo (custom avatar) or regular avatar
    const isCustomAvatar = avatar.includes('_wealth_mogul');
    
    // Voice selection based on avatar gender - using proper male/female voices
    let voiceId;
    if (avatar.includes('daisy_wealth_mogul')) {
      voiceId = 'f8c69e517f424cafaecde32dde57096b'; // Allison - Female voice for Daisy
    } else if (avatar.includes('laurier_wealth_mogul')) {
      voiceId = '897d6a9b2c844f56aa077238768fe10a'; // Alex - Male voice for Laurier
    } else if (avatar.includes('mason_wealth_mogul')) {
      voiceId = '5d8c378ba8c3434586081a52ac368738'; // Mark - Male voice for Mason
    } else {
      voiceId = '1bd001e7e50f421d891986aad5158bc8'; // Default working voice
    }

    // Process script based on platform and duration
    let processedScript = script;
    if (platform === 'instagram') {
      // Instagram has shorter duration limits
      const maxChars = duration === 30 ? 200 : 400;
      processedScript = script.substring(0, maxChars);
    } else if (platform === 'youtube') {
      // YouTube can handle longer scripts
      const maxChars = duration === 120 ? 800 : duration === 180 ? 1200 : 2000;
      processedScript = script.substring(0, maxChars);
    }

    const videoConfig = {
      video_inputs: [
        {
          character: isCustomAvatar ? {
            type: 'talking_photo',
            talking_photo_id: heygenAvatar,
            talking_photo_style: 'square',
            talking_style: 'stable',
            expression: 'default'
          } : {
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

    console.log('📤 HeyGen API Config:', {
      avatar: heygenAvatar,
      scriptLength: processedScript.length,
      platform,
      duration,
      dimensions: videoConfig.dimension
    });

    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoConfig)
    });

    const responseData = await response.json();
    
    console.log('📥 HeyGen API Response:', {
      status: response.status,
      data: responseData,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      console.error('❌ HeyGen API Error:', responseData);
      return res.status(response.status).json({ 
        error: responseData.error || 'HeyGen API request failed',
        details: responseData 
      });
    }

    if (responseData.error) {
      return res.status(400).json({ 
        error: responseData.error.message || 'HeyGen API error',
        details: responseData.error 
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      videoId: responseData.data.video_id,
      status: 'processing',
      provider: 'heygen',
      platform,
      duration,
      avatar,
      title,
      message: 'Video generation started successfully',
      estimatedTime: '2-3 minutes'
    });

  } catch (error) {
    console.error('💥 HeyGen API Handler Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

