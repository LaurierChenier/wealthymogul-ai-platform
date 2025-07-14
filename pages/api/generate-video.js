export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, script } = req.body;

  // Debug what we're receiving
  console.log('Received request body:', req.body);
  console.log('Title:', title);
  console.log('Script:', script ? script.substring(0, 100) + '...' : 'No script');
  console.log('Eden AI Key exists:', !!process.env.EDEN_AI_API_KEY);

  try {
    const requestBody = {
      providers: ['amazon/amazon.nova-reel-v1:0'],
      text: script || 'Welcome to WealthyMogul.com! This is a test video.',
      duration: 6,
      resolution: '1280x720',
      response_as_dict: true,
      attributes_as_list: false,
      show_base_64: false,
      show_original_response: false
    };

    console.log('Sending to Eden AI:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.edenai.run/v2/video/generation_async', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    console.log('Eden AI Response Status:', response.status);
    console.log('Eden AI Response:', JSON.stringify(data, null, 2));

    return res.status(200).json({
      debug: true,
      requestReceived: req.body,
      sentToEdenAI: requestBody,
      edenResponse: data,
      responseStatus: response.status,
      success: response.ok
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ 
      debug: true,
      error: error.message,
      stack: error.stack
    });
  }
}
