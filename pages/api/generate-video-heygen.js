// Debug version of HeyGen API to troubleshoot 404 errors
export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  console.log('Request body:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First, just test if the API key exists
    const apiKey = process.env.HEYGEN_API_KEY;
    console.log('API key exists:', !!apiKey);
    
    if (!apiKey) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    // Test basic HeyGen API connectivity
    const testResponse = await fetch('https://api.heygen.com/v2/avatars', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    console.log('HeyGen API test response:', testResponse.status);

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('HeyGen API error:', errorText);
      return res.status(testResponse.status).json({ 
        error: 'HeyGen API connectivity test failed',
        details: errorText 
      });
    }

    // If we get here, API key works
    return res.status(200).json({
      success: true,
      message: 'HeyGen API connectivity test passed',
      debug: 'API key is working'
    });

  } catch (error) {
    console.error('Error in HeyGen API test:', error);
    return res.status(500).json({ 
      error: 'HeyGen API test failed',
      details: error.message
    });
  }
}
