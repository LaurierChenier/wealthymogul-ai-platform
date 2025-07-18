export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are allowed.' });
  }

  const { prompt, platform = 'youtube' } = req.body;
  if (!prompt) {
    return res.status(400).json({ code: 'PROMPT_REQUIRED', message: 'Prompt is required.' });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return res.status(500).json({ code: 'OPENAI_API_KEY_MISSING', message: 'OpenAI API key not configured.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        size: platform === 'instagram' ? '1024x1792' : '1792x1024',
        quality: 'standard',
        n: 1
      })
    });

    const data = await response.json();

    if (response.ok && data.data && data.data[0]) {
      return res.status(200).json({
        success: true,
        imageUrl: data.data[0].url,
        prompt: prompt,
        platform: platform
      });
    } else {
      return res.status(response.status).json({
        code: 'OPENAI_IMAGE_ERROR',
        message: data.error?.message || 'Image generation failed.',
        details: data
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'Unexpected server error.',
      details: error.message
    });
  }
}
