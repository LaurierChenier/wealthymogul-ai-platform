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

    // Create safe tag from topic
    const topicTag = topic ? topic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : 'wealth';

    // Mock AI-generated content with error handling
    const mockContent = {
      title: `${topic}: The Ultimate Guide to Building Wealth`,
      description: `Discover powerful strategies for ${topic.toLowerCase()} that the wealthy use to build generational wealth. Learn insider secrets, proven techniques, and actionable steps you can implement today to start your journey to financial freedom.`,
      category: 'Finance & Business',
      tags: [
        topicTag,
        'wealth-building',
        'financial-freedom',
        'investment-strategies',
        'money-management'
      ],
      duration: Math.floor(Math.random() * 15) + 5 + ' minutes',
      thumbnailUrl: null,
      scriptPreview: `Welcome to WealthyMogul.com! Today we're exploring ${topic}, a powerful wealth-building strategy that can transform your financial future.`,
      status: 'generated',
      generatedAt: new Date().toISOString()
    };

    return res.status(200).json(mockContent);
  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message 
    });
  }
}
