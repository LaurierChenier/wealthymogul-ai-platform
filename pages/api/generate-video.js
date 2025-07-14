export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, script } = req.body;

  if (!title || !script) {
    return res.status(400).json({ error: 'Title and script are required' });
  }

  try {
    // Proper truncation: account for "..." in character count
    let truncatedScript;
    if (script.length > 512) {
      truncatedScript = script.substring(0, 509) + '...'; // 509 + 3 = 512 exactly
    } else {
      truncatedScript = script;
    }
    
    console.log('Original script length:', script.length);
    console.log('Truncated script length:', truncatedScript.length);

    const response = await fetch('https://api.edenai.run/v2/video/generation_async', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        providers: ['amazon/amazon.nova-reel-v1:0'],
        text: truncatedScript,
        duration: 6,
        resolution: '1280x720',
        response_as_dict: true,
        attributes_as_list: false,
        show_base_64: false,
        show_original_response: false
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Eden AI Error:', data);
      return res.status(400).json({ 
        success: false,
        error: 'Video generation failed',
        details: data 
      });
    }

    return res.status(200).json({
      success: true,
      title: title,
      script: truncatedScript,
      rawEdenResponse: data,
      publicId: data.public_id,
      status: data.status || 'processing',
      message: 'Video generation request submitted',
      generatedAt: new Date().toISOString(),
      provider: 'eden-ai',
      duration: '6 seconds',
      resolution: '1280x720',
      retrieveUrl: `https://api.edenai.run/v2/video/generation_async/${data.public_id}`,
      note: script.length > 512 ? 'Script was truncated to 512 characters for video generation' : ''
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
