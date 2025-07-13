export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Call OpenAI API
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
            content: 'You are an expert wealth-building content creator. Generate engaging video content about financial strategies. Return a JSON object with title, description, category, and tags.'
          },
          {
            role: 'user',
            content: `Create a wealth-building video about "${topic}". Generate an engaging title, compelling description (2-3 sentences), appropriate category, and 5 relevant tags. Format as JSON with fields: title, description, category, tags (array), scriptPreview (opening 2 sentences).`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Parse OpenAI response
    let aiContent;
    try {
      aiContent = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      // Fallback if AI doesn't return valid JSON
      aiContent = {
        title: `${topic}: Advanced Wealth Building Strategies`,
        description: `Master the secrets of ${topic.toLowerCase()} used by successful investors and entrepreneurs. Learn proven techniques to build sustainable wealth and achieve financial freedom.`,
        category: 'Finance & Business',
        tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'wealth-building', 'financial-freedom', 'investment-strategies', 'money-management'],
        scriptPreview: `Welcome to WealthyMogul.com! Today we're exploring ${topic}, one of the most powerful wealth-building strategies available.`
      };
    }

    // Return formatted response
    const result = {
      title: aiContent.title || `${topic}: The Ultimate Guide to Building Wealth`,
      description: aiContent.description || `Discover powerful strategies for ${topic.toLowerCase()} that the wealthy use to build generational wealth.`,
      category: aiContent.category || 'Finance & Business',
      tags: aiContent.tags || [topic.toLowerCase().replace(/\s+/g, '-'), 'wealth-building', 'financial-freedom'],
      duration: Math.floor(Math.random() * 15) + 5 + ' minutes',
      thumbnailUrl: null,
      scriptPreview: aiContent.scriptPreview || `Welcome to WealthyMogul.com! Today we're diving deep into ${topic}.`,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      source: 'openai-gpt4o'
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
