export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI-generated content (replace with real OpenAI integration later)
    const mockContent = {
      title: `${topic}: The Ultimate Guide to Building Wealth`,
      description: `Discover powerful strategies for ${topic.toLowerCase()} that the wealthy use to build generational wealth. Learn insider secrets, proven techniques, and actionable steps you can implement today to start your journey to financial freedom.`,
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
      scriptPreview: `Welcome to WealthyMogul.com! Today we're diving deep into ${topic}. This is one of the most powerful wealth-building strategies used by millionaires and billionaires around the world...`,
      status: 'generated',
      generatedAt: new Date().toISOString()
    };

    res.status(200).json(mockContent);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
}
