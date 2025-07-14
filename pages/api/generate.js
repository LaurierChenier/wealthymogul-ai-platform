export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // More robust OpenAI API call with better error handling
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using faster, more reliable model
        messages: [
          {
            role: 'system',
            content: 'You are an expert content creator for WealthyMogul.com. Create engaging wealth building content. Respond ONLY with valid JSON.'
          },
          {
            role: 'user',
            content: `Create video content about "${topic}". Return only this JSON format:
{
  "title": "SEO title under 60 chars",
  "description": "Compelling 120-150 word description",
  "script": "Detailed 400-600 word script",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        timeout: 30
      })
    });

    let contentData = null;

    if (openaiResponse.ok) {
      const data = await openaiResponse.json();
      const aiContent = data.choices[0].message.content;

      // Try to parse AI response
      try {
        contentData = JSON.parse(aiContent.trim());
      } catch (parseError) {
        console.log('JSON parse failed, using fallback');
        contentData = null;
      }
    } else {
      console.log(`OpenAI API error: ${openaiResponse.status}`);
      contentData = null;
    }

    // Use AI content if successful, otherwise enhanced fallback
    if (contentData && contentData.title && contentData.script) {
      return res.status(200).json({
        title: contentData.title,
        description: contentData.description,
        category: 'Finance & Business',
        tags: contentData.tags || [topic.toLowerCase().replace(/\s+/g, '-'), 'wealth-building'],
        duration: 'AI-generated',
        thumbnailUrl: null,
        scriptPreview: contentData.script,
        status: 'generated',
        generatedAt: new Date().toISOString(),
        aiGenerated: true
      });
    } else {
      // Enhanced fallback content (much better than old mock)
      const topicTag = topic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      return res.status(200).json({
        title: `${topic}: Proven Wealth Building Strategies That Work`,
        description: `Discover the exact ${topic.toLowerCase()} strategies that millionaires and billionaires use to build generational wealth. In this comprehensive guide, you'll learn insider secrets, proven techniques, and actionable steps that you can implement immediately to accelerate your journey to financial freedom. These are the same methods used by the wealthy elite to create passive income streams and build lasting wealth.`,
        category: 'Finance & Business',
        tags: [topicTag, 'wealth-building', 'financial-freedom', 'investment-strategies', 'money-management', 'passive-income'],
        duration: 'AI-enhanced',
        thumbnailUrl: null,
        scriptPreview: `Welcome to WealthyMogul.com! I'm here to share the exact ${topic} strategies that have helped countless individuals build massive wealth. Today, we're diving deep into insider secrets that most people never learn - the same strategies used by millionaires and billionaires to create generational wealth. Whether you're just starting your wealth-building journey or looking to accelerate your results, this information will transform how you think about money and investing. Let's start with the most powerful strategy that 90% of wealthy people use but never talk about publicly. This approach alone can help you build substantial wealth over time, even if you're starting with limited capital. The key is understanding how compound growth works and leveraging it to your advantage. Many people think wealth building is about making more money, but that's only part of the equation. The real secret lies in understanding how to make your money work for you, creating multiple income streams that generate cash flow while you sleep. Throughout this video, I'll share specific examples, real-world case studies, and actionable steps you can take today to start implementing these strategies in your own life.`,
        status: 'generated (enhanced fallback)',
        generatedAt: new Date().toISOString(),
        aiGenerated: false
      });
    }

  } catch (error) {
    console.error('Generation error:', error);
    
    // Basic fallback if everything fails
    const topicTag = topic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    return res.status(200).json({
      title: `${topic}: Building Wealth Strategies`,
      description: `Learn powerful ${topic.toLowerCase()} strategies for building wealth and achieving financial freedom.`,
      category: 'Finance & Business',
      tags: [topicTag, 'wealth-building', 'financial-freedom'],
      duration: 'Generated',
      thumbnailUrl: null,
      scriptPreview: `Welcome to WealthyMogul.com! Today we're exploring ${topic} strategies for building wealth...`,
      status: 'generated (basic fallback)',
      generatedAt: new Date().toISOString(),
      aiGenerated: false
    });
  }
}
