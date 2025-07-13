export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, script } = req.body;

  if (!title || !script) {
    return res.status(400).json({ error: 'Title and script are required' });
  }

  try {
    // Create form data for Eden AI - simplified version
    const formData = new FormData();
    formData.append('providers', 'amazon');
    formData.append('text', script);
    // Remove settings entirely to use defaults
    // formData.append('settings', JSON.stringify({
    //   'amazon': 'amazon.nova-reel-v1:0'
    // }));

    console.log('Sending request to Eden AI...');
    console.log('API Key exists:', !!process.env.EDEN_AI_API_KEY);
    console.log('API Key starts with:', process.env.EDEN_AI_API_KEY?.substring(0, 20));

    const response = await fetch('https://api.edenai.run/v2/video/generation_async', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();
    
    console.log('Eden AI Video Generation Response Status:', response.status);
    console.log('Eden AI Video Generation Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Eden AI API Error:', data);
      throw new Error(`Eden AI API error (${response.status}): ${JSON.stringify(data)}`);
    }

    // Return the public_id for polling
    return res.status(200).json({
      success: true,
      title: title,
      script: script,
      rawEdenResponse: data,
      publicId: data.public_id,
      status: data.status || 'submitted',
      message: 'Video generation request submitted',
      generatedAt: new Date().toISOString(),
      provider: 'eden-ai',
      duration: '6 seconds',
      resolution: '1280x720',
      retrieveUrl: `https://api.edenai.run/v2/video/generation_async/${data.public_id}`
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to generate video',
      details: error.message 
    });
  }
}
