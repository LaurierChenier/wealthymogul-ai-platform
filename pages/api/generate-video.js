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
    
    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('providers', 'amazon');
    formData.append('text', script);
    formData.append('duration', '6');
    formData.append('fps', '24');
    formData.append('dimension', '1280x720');
    formData.append('seed', '12');

    // Call Eden AI Video Generation API (ASYNC)
    const response = await fetch('https://api.edenai.run/v2/video/generation_async', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`,
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('Eden AI Raw Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Eden AI Parsed Data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON response from Eden AI',
        responseText: responseText.substring(0, 1000),
        status: response.status
      });
    }

    if (!response.ok) {
      throw new Error(`Eden AI error: ${response.status} - ${data.detail || data.message || 'Unknown error'}`);
    }

    // Debug: Show exactly what we received
    const result = {
      success: true,
      title: title || 'Generated Video',
      script: script,
      // Show ALL the data we received for debugging
      rawEdenResponse: data,
      publicId: data.public_id || 'NOT_FOUND',
      status: data.status || 'unknown',
      message: 'Video generation request submitted',
      generatedAt: new Date().toISOString(),
      provider: 'eden-ai',
      duration: '6 seconds',
      resolution: '1280x720',
      retrieveUrl: data.public_id ? `https://api.edenai.run/v2/video/generation_async/${data.public_id}` : 'NO_PUBLIC_ID'
    };

    console.log('Sending result:', JSON.stringify(result, null, 2));
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
