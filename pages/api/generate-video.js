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
    console.log('API Key exists:', !!process.env.EDEN_AI_API_KEY);
    console.log('API Key start:', process.env.EDEN_AI_API_KEY?.substring(0, 20));
    
    // Call Eden AI Video Generation API
    const response = await fetch('https://api.edenai.run/v2/video/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers: ["stability"], 
        text_prompt: script,
        duration: 5,
        resolution: "1280x720"
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Get raw response text first
    const responseText = await response.text();
    console.log('Raw response:', responseText.substring(0, 500));

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON response from Eden AI',
        responseText: responseText.substring(0, 1000),
        status: response.status,
        hasApiKey: !!process.env.EDEN_AI_API_KEY
      });
    }

    if (!response.ok) {
      throw new Error(`Eden AI error: ${response.status} - ${data.detail || 'Unknown error'}`);
    }

    console.log('Eden AI response:', data);

    // Return success
    const result = {
      success: true,
      title: title || 'Generated Video',
      script: script,
      videoData: data,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      provider: 'eden-ai'
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
