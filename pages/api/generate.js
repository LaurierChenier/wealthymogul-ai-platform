export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple test - just check if API key works
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Say "OpenAI is working!" and nothing else.' }],
        max_tokens: 10
      })
    });

    const data = await response.json();
    
    return res.status(200).json({
      test: 'OpenAI Connection Test',
      status: response.status,
      working: response.ok,
      message: data.choices?.[0]?.message?.content || 'No response',
      hasApiKey: !!process.env.OPENAI_API_KEY,
      keyStart: process.env.OPENAI_API_KEY?.substring(0, 10)
    });

  } catch (error) {
    return res.status(500).json({ 
      test: 'OpenAI Connection Test',
      error: error.message,
      hasApiKey: !!process.env.OPENAI_API_KEY
    });
  }
}
