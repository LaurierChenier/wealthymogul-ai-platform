export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    
    if (response.ok) {
      return res.status(200).json({ 
        success: true, 
        message: "OpenAI API key is working!",
        status: response.status 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: `OpenAI API error: ${response.status}`,
        message: await response.text()
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
