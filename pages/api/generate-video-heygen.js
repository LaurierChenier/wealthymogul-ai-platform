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

    // Avatar mapping with YOUR CUSTOM AVATARS
    const avatarMapping = {
      // Custom Wealthy Mogul avatars - YOUR ACTUAL AVATARS
      'daisy_wealth_mogul': 'ae573c3333854730a9077d80b53d97e5',     // Daisy (female)
      'laurier_wealth_mogul': '7f7b982477074c11b8593d0c60690f0a',   // Laurier (male)
      'mason_wealth_mogul': 'f379aa769b474121a59c128ebdcee2ad',     // Mason (male)
      
      // HeyGen stock avatars (fallback)
      'sonia_costume1_cameraA': 'Josh_20230826_135716_image',
      'female_professional_1': 'Angela-inblackskirt-20220820',
      'female_professional_2': 'Daisy-inskirt-20220818',
      'female_casual_1': 'Angela-inblackskirt-20220820',
      'female_casual_2': 'Daisy-inskirt-20220818',
      'male_professional_1': 'Josh_20230826_135716_image',
      'male_professional_2': 'Josh_20230826_135716_image',
      'male_casual_1': 'Josh_20230826_135716_image',
      'male_casual_2': 'Josh_20230826_135716_image'
    };

    const heygenAvatar = avatarMapping[avatar] || 'ae573c3333854730a9077d80b53d97e5'; // Default to Daisy
    
    // Voice selection based on avatar gender
    let voiceId = '119caed25533477ba63822d5d1552d25'; // Default female voice
    if (avatar === 'laurier_wealth_mogul' || avatar === 'mason_wealth_mogul') {
      voiceId = '2d5b0e6c4a5749de8b6b6b9b8b4b4b4b'; // Male voice (placeholder - needs actual male voice ID)
    }

    // Process script based on platform and duration
    let processedScript = script;
    if (platform === 'instagram') {
      const maxChars = duration === 30 ? 200 : 400;
      processedScript = script.substring(0, maxChars);
    } else if (platform === 'youtube') {
      const maxChars = duration === 120 ? 800 : duration === 180 ? 1200 : 2000;
      processedScript = script.substring(0, maxChars);
    }

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
