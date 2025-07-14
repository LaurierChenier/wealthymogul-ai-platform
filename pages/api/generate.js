export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Create Python script to call OpenAI
    const pythonScript = `
import sys
import asyncio
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

async def generate_content():
    try:
        # Initialize OpenAI chat with gpt-4o
        chat = LlmChat(
            api_key="${process.env.OPENAI_API_KEY}",
            session_id="content-generation-${Date.now()}",
            system_message="""You are an expert content creator for WealthyMogul.com, specializing in wealth building and real estate education. Create engaging, informative content that attracts viewers and generates ad revenue.

Your task is to create:
1. An engaging, SEO-optimized title (50-60 characters)
2. A compelling description (120-150 words) 
3. A detailed 2-3 minute video script (400-600 words)
4. 5-8 relevant tags for discoverability

Focus on actionable advice, insider secrets, and proven strategies that wealthy people use. Make content exciting and valuable."""
        ).with_model("openai", "gpt-4o").with_max_tokens(2000)

        # Create user message
        user_message = UserMessage(
            text=f"""Create comprehensive video content about: ${topic}

Please provide ONLY a JSON response with these exact fields:
{{
  "title": "SEO-optimized title (50-60 chars)",
  "description": "Compelling description that hooks viewers (120-150 words)",
  "script": "Detailed 2-3 minute video script (400-600 words) that provides real value",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}}

Make the script conversational, engaging, and packed with actionable insights. Include specific examples and insider tips that wealthy people actually use."""
        )

        # Send message and get response
        response = await chat.send_message(user_message)
        
        # Try to parse JSON from response
        try:
            content_data = json.loads(response)
        except:
            # If response isn't pure JSON, try to extract JSON part
            import re
            json_match = re.search(r'\\{.*\\}', response, re.DOTALL)
            if json_match:
                content_data = json.loads(json_match.group())
            else:
                raise Exception("Could not parse AI response as JSON")
        
        # Ensure all required fields exist
        result = {
            "title": content_data.get("title", f"${topic}: Advanced Wealth Building Strategies"),
            "description": content_data.get("description", f"Discover powerful ${topic.toLowerCase()} strategies used by the wealthy to build generational wealth."),
            "script": content_data.get("script", f"Welcome to WealthyMogul.com! Today we're exploring ${topic}..."),
            "tags": content_data.get("tags", ["${topic.toLowerCase().replace(/\s+/g, '-')}", "wealth-building", "financial-freedom"])
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": True,
            "message": str(e),
            "fallback": {
                "title": f"${topic}: The Ultimate Wealth Building Guide",
                "description": f"Discover powerful strategies for ${topic.toLowerCase()} that the wealthy use to build generational wealth. Learn insider secrets, proven techniques, and actionable steps you can implement today.",
                "script": f"Welcome to WealthyMogul.com! Today we're diving deep into ${topic}, one of the most powerful wealth-building strategies used by millionaires and billionaires. In this video, I'll share insider secrets that most people never learn...",
                "tags": ["${topic.toLowerCase().replace(/\s+/g, '-')}", "wealth-building", "financial-freedom", "investment-strategies"]
            }
        }
        print(json.dumps(error_result))

# Run the async function
asyncio.run(generate_content())
`;

    // Execute Python script
    const { spawn } = require('child_process');
    const python = spawn('python3', ['-c', pythonScript]);
    
    let result = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    await new Promise((resolve, reject) => {
      python.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python process exited with code ${code}: ${error}`));
        }
      });
    });

    // Parse the result
    const contentData = JSON.parse(result);
    
    if (contentData.error) {
      // Use fallback content if AI failed
      const fallback = contentData.fallback;
      return res.status(200).json({
        ...fallback,
        category: 'Finance & Business',
        duration: 'AI-generated',
        thumbnailUrl: null,
        scriptPreview: fallback.script.substring(0, 200) + '...',
        status: 'generated (fallback)',
        generatedAt: new Date().toISOString(),
        aiGenerated: false
      });
    } else {
      // Return AI-generated content
      return res.status(200).json({
        title: contentData.title,
        description: contentData.description,
        category: 'Finance & Business',
        tags: contentData.tags,
        duration: 'AI-generated',
        thumbnailUrl: null,
        scriptPreview: contentData.script,
        status: 'generated',
        generatedAt: new Date().toISOString(),
        aiGenerated: true
      });
    }

  } catch (error) {
    console.error('Generation error:', error);
    
    // Fallback to enhanced mock content
    const topicTag = topic ? topic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : 'wealth';
    
    return res.status(200).json({
      title: `${topic}: Advanced Wealth Building Strategies That Actually Work`,
      description: `Discover the exact ${topic.toLowerCase()} strategies that millionaires and billionaires use to build generational wealth. In this comprehensive guide, you'll learn insider secrets, proven techniques, and actionable steps that you can implement immediately to accelerate your journey to financial freedom.`,
      category: 'Finance & Business',
      tags: [
        topicTag,
        'wealth-building',
        'financial-freedom',
        'investment-strategies',
        'money-management',
        'millionaire-mindset'
      ],
      duration: 'AI-generated',
      thumbnailUrl: null,
      scriptPreview: `Welcome to WealthyMogul.com! I'm here to share the exact ${topic} strategies that have helped countless individuals build massive wealth. Today, we're diving deep into insider secrets that most people never learn - the same strategies used by millionaires and billionaires to create generational wealth. Whether you're just starting your wealth-building journey or looking to accelerate your results, this information will transform how you think about money and investing...`,
      status: 'generated (enhanced fallback)',
      generatedAt: new Date().toISOString(),
      aiGenerated: false
    });
  }
}
