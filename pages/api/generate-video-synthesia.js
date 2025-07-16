// Enhanced Synthesia AI Avatar Video Generation API with YouTube Debug Fixes
export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script, duration = 120, platform = 'youtube', avatar = 'sonia_costume1_cameraA' } = req.body;
    
    console.log('Extracted values:', { title, script: script?.substring(0, 100), duration, platform, avatar });
    
    if (!title || !script) {
      return res.status(400).json({ 
        error: 'Title and script are required',
        debug: { title: !!title, script: !!script, titleValue: title, scriptLength: script?.length }
      });
    }

    // Get API key from environment
    const apiKey = process.env.SYNTHESIA_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Synthesia API key not configured' });
    }

    // Platform-specific script processing and validation
    let processedScript = script;
    let selectedAvatar = avatar;
    
    if (platform === 'youtube') {
      // YouTube-specific fixes
      
      // Fix 1: Script length validation based on duration
      const maxScriptLength = duration <= 120 ? 400 : duration <= 180 ? 600 : 800;
      processedScript = script.substring(0, maxScriptLength);
      
      // Fix 2: Duration validation (Synthesia max 5 minutes per scene)
      if (duration > 300) {
        return res.status(400).json({ 
          error: 'YouTube videos cannot exceed 5 minutes per scene',
          debug: { requestedDuration: duration, maxAllowed: 300 }
        });
      }
      
      // Fix 3: Avatar compatibility for longer content
      // Use more flexible avatars for YouTube content
      const youtubeCompatibleAvatars = [
        'sonia_costume1_cameraA',
        'anna_costume1_cameraA', 
        'matthew_costume1_cameraA',
        'mike_costume1_cameraA'
      ];
      
      if (!youtubeCompatibleAvatars.includes(avatar)) {
        selectedAvatar = 'sonia_costume1_cameraA'; // Fallback to known working avatar
        console.log('Avatar fallback applied for YouTube:', selectedAvatar);
      }
      
      // Fix 4: Content preprocessing for YouTube
      processedScript = processedScript
        .replace(/\b(guaranteed|promise|definitely will)\b/gi, 'may potentially')
        .replace(/\b(get rich quick|instant wealth)\b/gi, 'build wealth over time')
        .replace(/\b(medical advice|legal advice)\b/gi, 'general information');
      
      console.log('YouTube processing applied:', {
        originalLength: script.length,
        processedLength: processedScript.length,
        duration,
        avatarUsed: selectedAvatar
      });
      
    } else if (platform === 'instagram') {
      // Instagram-specific processing (already working)
      const maxLength = duration === 30 ? 200 : 400;
      processedScript = script.substring(0, maxLength);
      
      console.log('Instagram processing applied:', {
        originalLength: script.length,
        processedLength: processedScript.length,
        duration
      });
    }

    // Prepare video configuration with correct Synthesia v2 API structure
    const videoConfig = {
      title: title,
      input: [
        {
          scriptText: processedScript,
          avatar: selectedAvatar,
          background: 'white'
        }
      ],
      visibility: 'public'
    };

    console.log('Creating Synthesia video with config:', {
      title,
      duration,
      platform,
      avatar: selectedAvatar,
      scriptLength: processedScript.length,
      configPreview: JSON.stringify(videoConfig, null, 2).substring(0, 200)
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
        details: errorText,
        debug: {
          platform,
          duration,
          avatar: selectedAvatar,
          scriptLength: processedScript.length,
          httpStatus: response.status
        }
      });
    }

    const result = await response.json();
    console.log('Synthesia video created successfully:', result);

    // Return the video ID for status checking
    return res.status(200).json({
      success: true,
      videoId: result.id,
      status: 'pending',
      message: `${platform === 'youtube' ? `${duration/60}-minute` : `${duration}-second`} AI avatar video generation started`,
      provider: 'synthesia',
      platform: platform,
      duration: duration,
      avatar: selectedAvatar,
      voice: 'en-US-JennyNeural',
      estimatedTime: '3-5 minutes',
      debug: {
        originalScriptLength: script.length,
        processedScriptLength: processedScript.length,
        avatarUsed: selectedAvatar,
        platformProcessing: platform
      }
    });

  } catch (error) {
    console.error('Error in Synthesia video generation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate AI avatar video',
      details: error.message,
      errorType: error.constructor.name,
      debug: {
        platform: req.body?.platform,
        duration: req.body?.duration,
        avatar: req.body?.avatar,
        scriptLength: req.body?.script?.length
      }
    });
  }
}
