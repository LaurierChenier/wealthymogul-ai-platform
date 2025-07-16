export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script, duration = 120, platform = 'youtube', avatar = 'sonia_costume1_cameraA' } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
    }

    const apiKey = process.env.SYNTHESIA_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Synthesia API key not configured' });
    }

    // Simple content processing
    let processedScript = script;
    let processedTitle = title;
    
    // Basic content moderation - replace obvious financial terms
    processedScript = processedScript
      .replace(/\binvest\b/gi, 'learn about')
      .replace(/\binvestment\b/gi, 'education')
      .replace(/\bfinancial advice\b/gi, 'educational information')
      .replace(/\bmoney\b/gi, 'value')
      .replace(/\bprofit\b/gi, 'benefit')
      .replace(/\bbuy\b/gi, 'consider')
      .replace(/\bguaranteed\b/gi, 'potentially')
      .replace(/\byou should\b/gi, 'one might')
      .replace(/\byou must\b/gi, 'it may be helpful to');

    processedTitle = processedTitle
      .replace(/\binvestment\b/gi, 'education')
      .replace(/\bstrategy\b/gi, 'concepts');

    // Platform-specific script length limits
    if (platform === 'youtube') {
      const maxLength = duration <= 120 ? 400 : duration <= 180 ? 600 : 800;
      processedScript = processedScript.substring(0, maxLength);
    } else if (platform === 'instagram') {
      const maxLength = duration === 30 ? 200 : 400;
      processedScript = processedScript.substring(0, maxLength);
    }

    const videoConfig = {
      title: processedTitle,
      input: [
        {
          scriptText: processedScript,
          avatar: avatar,
          background: 'white'
        }
      ],
      visibility: 'public'
    };

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
      return res.status(response.status).json({ 
        error: 'Failed to create video',
        details: errorText 
      });
    }

    const result = await response.json();

    return res.status(200).json({
      success: true,
      videoId: result.id,
      status: 'pending',
      message: `${platform === 'youtube' ? `${duration/60}-minute` : `${duration}-second`} AI avatar video generation started`,
      provider: 'synthesia',
      platform: platform,
      duration: duration,
      avatar: avatar,
      voice: 'en-US-JennyNeural',
      estimatedTime: '3-5 minutes'
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to generate AI avatar video',
      details: error.message
    });
  }
}
