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
    const { title, script, duration = 120, platform = 'youtube', avatar = 'daisy_wealth_mogul', avatarId } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    // Dynamic avatar handling - use provided avatarId or fall back to mapping
    let heygenAvatar = avatarId; // Use dynamic avatar ID if provided
    let isCustomAvatar = true;
    
    // Fallback avatar mapping (in case dynamic loading fails)
    if (!heygenAvatar) {
      const fallbackAvatarMapping = {
        'daisy_wealth_mogul': 'ae573c3333854730a9077d80b53d97e5',     // Daisy
        'laurier_wealth_mogul': '7f7b982477074c11b8593d0c60690f0a',   // Laurier
        'mason_wealth_mogul': 'f379aa769b474121a59c128ebdcee2ad',     // Mason
      };
      
      heygenAvatar = fallbackAvatarMapping[avatar] || 'ae573c3333854730a9077d80b53d97e5';
      isCustomAvatar = avatar.includes('_wealth_mogul') || avatar.includes('_avatar');
    }

    // Voice selection based on avatar gender - enhanced for dynamic avatars
    let voiceId;
    if (avatar.includes('daisy') || avatar.toLowerCase().includes('female')) {
      voiceId = 'f8c69e517f424cafaecde32dde57096b'; // Allison - Female voice
    } else if (avatar.includes('laurier') || avatar.includes('mason') || avatar.toLowerCase().includes('male')) {
      voiceId = avatar.includes('laurier') ? '897d6a9b2c844f56aa077238768fe10a' : '5d8c378ba8c3434586081a52ac368738';
    } else {
      // Default voice selection based on avatar name
      voiceId = 'f8c69e517f424cafaecde32dde57096b'; // Default to female voice
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

    // ENHANCED VIDEO CONFIGURATION with dynamic avatar support
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
      caption: true,                    // 🆕 ENABLE SUBTITLES
      caption_template: 'v2',           // 🆕 BETTER CAPTION STYLING
      title: title,                     // 🆕 ADD TITLE TO VIDEO
      ratio: platform === 'instagram' ? '9:16' : '16:9'  // 🆕 PROPER ASPECT RATIO
    };

    console.log('📤 Enhanced HeyGen API Config:', {
      avatar: heygenAvatar,
      avatarType: isCustomAvatar ? 'talking_photo' : 'avatar',
      scriptLength: processedScript.length,
      platform,
      duration,
      dimensions: videoConfig.dimension,
      subtitles: videoConfig.caption,
      title: videoConfig.title,
      voice: voiceId
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
      avatarId: heygenAvatar,
      title,
      message: 'Enhanced video generation started successfully',
      estimatedTime: '2-3 minutes',
      enhancements: {
        subtitles: true,
        watermark_removed: true,
        title_included: true,
        automatic_avatars: true,
        custom_avatars_only: true
      }
    });

  } catch (error) {
    console.error('💥 HeyGen API Handler Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
