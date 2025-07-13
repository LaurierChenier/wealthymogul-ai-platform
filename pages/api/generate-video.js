export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { script, title } = req.body;

  if (!script) {
    return res.status(400).json({ error: 'Video script is required' });
  }

  try {
    console.log('Generating video with Eden AI...');
    
    // Call Eden AI Video Generation API
    const response = await fetch('https://api.edenai.run/v2/video/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers: ["stability"], // Or other available providers
        text_prompt: script,
        duration: 5, // 5-second videos for social media
        resolution: "1280x720", // HD quality
        settings: {
          stability: {
            style: "photorealistic",
            motion_strength: 5
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Eden AI error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Eden AI response:', data);

    // Return video generation result
    const result = {
      success: true,
      title: title || 'Generated Video',
      script: script,
      videoData: data,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      provider: 'eden-ai',
      duration: '5 seconds',
      resolution: '1280x720'
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      hasApiKey: !!process.env.EDEN_AI_API_KEY
    });
  }
}
