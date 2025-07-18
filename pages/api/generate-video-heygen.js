export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, script, avatar = 'daisy_wealth_mogul' } = req.body;
  
  if (!title || !script) {
    return res.status(400).json({ error: 'Title and script required' });
  }

  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key missing' });
  }

  try {
    const avatarId = avatar === 'laurier_wealth_mogul' ? '7f7b982477074c11b8593d0c60690f0a' : 
                     avatar === 'mason_wealth_mogul' ? 'f379aa769b474121a59c128ebdcee2ad' : 
                     'ae573c3333854730a9077d80b53d97e5';

    const voiceId = avatar === 'laurier_wealth_mogul' ? '897d6a9b2c844f56aa077238768fe10a' : 
                    avatar === 'mason_wealth_mogul' ? '5d8c378ba8c3434586081a52ac368738' : 
                    'f8c69e517f424cafaecde32dde57096b';

    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'talking_photo',
            talking_photo_id: avatarId,
            talking_photo_style: 'square'
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: voiceId
          }
        }],
        test: false,
        caption: true,
        title: title
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'HeyGen API failed' });
    }

    return res.status(200).json({
      success: true,
      videoId: data.data.video_id,
      status: 'processing',
      provider: 'heygen',
      message: 'Video started'
    });

  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
