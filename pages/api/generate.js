export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a wealth-building content expert. Create engaging video content about financial strategies that helps people build wealth.'
          },
          {
            role: 'user',
            content: `Create a compelling wealth-building video about "${topic}". Generate: 1) An engaging title, 2) A persuasive 2-sentence description, 3) Category, 4) 5 relevant tags, 5) Opening script (2 sentences). Focus on practical wealth-building strategies.`
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI response or use structured fallback
    const result = {
      title: `${topic}: Master Wealth Building Strategies`,
      description: `Discover proven ${topic.toLowerCase()} techniques that successful investors use to build generational wealth. Learn actionable strategies you can implement today to accelerate your path to financial freedom.`,
      category: 'Finance & Business',
      tags: [
        topic.toLowerCase().replace(/\s+/g, '-'),
        'wealth-building',
        'financial-freedom',
        'investment-strategies',
        'money-management'
      ],
      duration: Math.floor(Math.random() * 15) + 5 + ' minutes',
      thumbnailUrl: null,
      scriptPreview: `Welcome to WealthyMogul.com! Today we're exploring ${topic}, a powerful wealth-building strategy that can transform your financial future. ${aiResponse.substring(0, 100)}...`,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      source: 'openai-gpt4o',
      aiContent: aiResponse
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('OpenAI generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate content', 
      details: error.message 
    });
  }
}
