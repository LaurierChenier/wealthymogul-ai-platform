export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Direct OpenAI API call (no Python needed)
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
            content: `You are an expert content creator for WealthyMogul.com, specializing in wealth building and real estate education. Create engaging, informative content that attracts viewers and generates ad revenue.

Your task is to create:
1. An engaging, SEO-optimized title (50-60 characters)
2. A compelling description (120-150 words) 
3. A detailed 2-3 minute video script (400-600 words)
4. 5-8 relevant tags for discoverability

Focus on actionable advice, insider secrets, and proven strategies that wealthy people use. Make content exciting and valuable.`
          },
          {
            role: 'user',
            content: `Create comprehensive video content about: ${topic}

Please provide ONLY a JSON response with these exact fields:
{
  "title": "SEO-optimized title (50-60 chars)",
  "description": "Compelling description that hooks viewers (120-150 words)",
  "script": "Detailed 2-3 minute video script (400-600 words) that provides real value",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Make the script conversational, engaging, and packed with actionable insights. Include specific examples and insider tips that wealthy people actually use.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    // Parse JSON from AI response
    let contentData;
    try {
      contentData = JSON.parse(aiContent);
    } catch (error) {
      // Try to extract JSON from response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contentData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Return AI-generated content
    return res.status(200).json({
      title: contentData.title || `${topic}: Advanced Wealth Building Strategies`,
      description: contentData.description || `Discover powerful ${topic.toLowerCase()} strategies used by the wealthy.`,
      category: 'Finance & Business',
      tags: contentData.tags || [topic.toLowerCase().replace(/\s+/g, '-'), 'wealth-building', 'financial-freedom'],
      duration: 'AI-generated',
      thumbnailUrl: null,
      scriptPreview: contentData.script || `Welcome to WealthyMogul.com! Today we're exploring ${topic}...`,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      aiGenerated: true
    });

  } catch (error) {
    console.error('OpenAI Generation error:', error);
    
    // Enhanced fallback content
    const topicTag = topic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    return res.status(200).json({
      title: `${topic}: Advanced Wealth Building Strategies That Work`,
      description: `Discover the exact ${topic.toLowerCase()} strategies that millionaires and billionaires use to build generational wealth. In this comprehensive guide, you'll learn insider secrets, proven techniques, and actionable steps that you can implement immediately to accelerate your journey to financial freedom.`,
      category: 'Finance & Business',
      tags: [topicTag, 'wealth-building', 'financial-freedom', 'investment-strategies', 'money-management'],
      duration: 'AI-generated',
      thumbnailUrl: null,
      scriptPreview: `Welcome to WealthyMogul.com! I'm here to share the exact ${topic} strategies that have helped countless individuals build massive wealth. Today, we're diving deep into insider secrets that most people never learn - the same strategies used by millionaires and billionaires to create generational wealth. Whether you're just starting your wealth-building journey or looking to accelerate your results, this information will transform how you think about money and investing. Let's start with the most powerful strategy that 90% of wealthy people use but never talk about publicly...`,
      status: 'generated (enhanced fallback)',
      generatedAt: new Date().toISOString(),
      aiGenerated: false
    });
  }
}
