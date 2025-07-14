export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, script } = req.body;

  if (!title || !script) {
    return res.status(400).json({ error: 'Title and script are required' });
  }

  try {
    // First, generate an image from the script (Runway requires image + text)
    const imageResponse = await fetch('https://api.runwayml.com/v1/image_generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAYML_API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gen4_image',
        prompt: `Professional video scene: ${script.substring(0, 300)}`,
        response_format: 'url'
      })
    });

    if (!imageResponse.ok) {
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0].url;

    // Then generate video using the image + script
    const videoResponse = await fetch('https://api.runwayml.com/v1/video_generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAYML_API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gen4_turbo',
        prompt_image: imageUrl,
        prompt_text: script.substring(0, 512), // Keep within limits
        duration: 30, // 30 seconds for YouTube monetization
        aspect_ratio: '16:9', // YouTube format
        response_format: 'url'
      })
    });

    if (!videoResponse.ok) {
      throw new Error(`Video generation failed: ${videoResponse.status}`);
    }

    const videoData = await videoResponse.json();

    return res.status(200).json({
      success: true,
      title: title,
      script: script,
      imageUrl: imageUrl,
      videoUrl: videoData.data[0].url,
      publicId: videoData.id,
      status: 'completed',
      message: 'Professional video generated successfully',
      generatedAt: new Date().toISOString(),
      provider: 'runway-ml',
      duration: '30 seconds',
      resolution: '1920x1080',
      format: '16:9 YouTube ready'
    });

  } catch (error) {
    console.error('Runway ML generation error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to generate professional video',
      details: error.message 
    });
  }
}
