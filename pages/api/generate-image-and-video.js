export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are allowed.' });
  }

  const { title, script, duration = 120, platform = 'youtube', avatar = 'daisy_wealth_mogul', graphicsPrompt = null, useGraphics = false, backgroundImageUrl = null } = req.body;

  if (!title || !script) {
    return res.status(400).json({ code: 'TITLE_SCRIPT_REQUIRED', message: 'Title and script are required.' });
  }

  const heygenApiKey = process.env.HEYGEN_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!heygenApiKey) {
    return res.status(500).json({ code: 'HEYGEN_API_KEY_MISSING', message: 'HeyGen API key not configured.' });
  }

  try {
    let backgroundImage = backgroundImageUrl;

    // Generate image if needed
    if (useGraphics && graphicsPrompt && openaiApiKey && !backgroundImage) {
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: graphicsPrompt,
          size: platform === 'instagram' ? '1024x1792' : '1792x1024',
          quality: 'standard',
          n: 1
        })
      });

      const imageData = await imageResponse.json();
      if (imageResponse.ok && imageData.data && imageData.data[0]) {
        backgroundImage = imageData.data[0].url;
      } else {
        return res.status(imageResponse.status).json({
          code: 'OPENAI_IMAGE_ERROR',
          message: imageData.error?.message || 'Image generation failed.',
          details: imageData
        });
      }
    }

    // Avatar and voice mapping
    const avatarId = avatar === 'laurier_wealth_mogul' ? '7f7b982477074c11b8593d0c60690f0a' :
      avatar === 'mason_wealth_mogul' ? 'f379aa769b474121a59c128ebdcee2ad' :
        'ae573c3333854730a9077d80b53d97e5';

    const voiceId = avatar === 'laurier_wealth_mogul' ? '897d6a9b2c844f56aa077238768fe10a' :
      avatar === 'mason_wealth_mogul' ? '5d8c378ba8c3434586081a52ac368738' :
        'f8c69e517f424cafaecde32dde57096b';

    const videoConfig = {
      video_inputs: [{
        character: {
          type: 'talking_photo',
          talking_photo_id: avatarId,
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

    if (backgroundImage) {
      videoConfig.background = {
        type: 'image',
        url: backgroundImage
      };
    }

    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': heygenApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoConfig)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        code: 'HEYGEN_API_ERROR',
        message: data.error || 'HeyGen API request failed.',
        details: data,
        config: videoConfig
      });
    }

    return res.status(200).json({
      success: true,
      videoId: data.data.video_id,
      status: 'processing',
      provider: 'heygen',
      platform,
      duration,
      avatar,
      title,
      backgroundImage,
      message: 'Video generation started successfully'
    });

  } catch (error) {
    return res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'Unexpected server error.',
      details: error.message
    });
  }
}
