export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, platform = 'youtube' } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    console.log('🎨 Generating image with DALL-E...');
    
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
      console.log('✅ Image generated successfully');
      return res.status(200).json({
        success: true,
        imageUrl: data.data[0].url,
        prompt: prompt,
        platform: platform
      });
    } else {
      console.error('❌ Image generation failed:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Image generation failed',
        details: data
      });
    }

  } catch (error) {
    console.error('💥 Server Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
}
