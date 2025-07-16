// Enhanced Synthesia AI Avatar Video with Duration Options
export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, script, duration = 120, platform = 'youtube' } = req.body;
    
    if (!title || !script) {
      return res.status(400).json({ error: 'Title and script are required' });
    }

    // Get API key from environment
    const apiKey = process.env.SYNTHESIA_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Synthesia API key not configured' });
    }

    // Create platform and duration-specific content
    let optimizedScript = script;
    let videoTitle = title;
    
    if (platform === 'instagram') {
      // Create Instagram-optimized script based on duration
      optimizedScript = createInstagramScript(script, title, duration);
      videoTitle = `${title} - Quick Tips`;
    } else if (platform === 'youtube') {
      // Adjust YouTube script based on duration
      optimizedScript = adjustYouTubeScript(script, title, duration);
    }

    // Platform and duration-specific visual configurations
    const visualConfig = getVisualConfig(platform, duration);

    // Enhanced video configuration
    const videoConfig = {
      title: videoTitle,
      input: [
        {
          scriptText: optimizedScript,
          avatar: 'sonia_costume1_cameraA',
          background: visualConfig.background,
          media: visualConfig.media,
          overlays: visualConfig.overlays
        }
      ],
      visibility: 'public',
      captions: {
        enabled: true,
        language: 'en',
        style: 'burned_in',
        font_size: platform === 'instagram' ? 20 : 18,
        color: '#ffffff',
        background_color: 'rgba(0,0,0,0.8)',
        position: 'bottom'
      },
      branding: {
        logo: {
          enabled: true,
          position: 'top_right',
          size: platform === 'instagram' ? 'medium' : 'small',
          opacity: 0.9
        },
        watermark: {
          text: 'WealthyMogul.com',
          position: 'bottom_left',
          font_size: platform === 'instagram' ? 16 : 14,
          color: '#ffffff',
          opacity: 0.8,
          background_color: 'rgba(102, 126, 234, 0.8)',
          padding: 8
        }
      }
    };

    console.log(`Creating ${platform} video: ${duration}s duration`);

    // Create video via Synthesia API
    const response = await fetch('https://api.synthesia.io/v2/videos', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Synthesia API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to create video',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log(`${platform} video created: ${duration}s duration`);

    // Return the video ID for status checking
    return res.status(200).json({
      success: true,
      videoId: result.id,
      status: 'pending',
      message: `${duration}s ${platform} optimized AI avatar video started`,
      provider: 'synthesia',
      platform: platform,
      duration: duration,
      avatar: 'sonia_costume1_cameraA',
      voice: 'en-US-JennyNeural',
      estimatedTime: '3-5 minutes',
      features: ['duration_optimized', 'real_estate_visuals', 'title_overlay', 'subtitles', 'logo', 'watermark']
    });

  } catch (error) {
    console.error('Error in duration-optimized video generation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate duration-optimized video',
      details: error.message,
      errorType: error.constructor.name
    });
  }
}

// Adjust YouTube script based on duration
function adjustYouTubeScript(script, title, duration) {
  if (duration === 120) {
    // 2-minute version: Concise but complete
    return script.length > 300 ? script.substring(0, 300) + "..." : script;
  } else if (duration === 180) {
    // 3-minute version: More detailed
    return script; // Use full script
  } else if (duration === 300) {
    // 5-minute version: Expanded content
    return `${script}

Let me elaborate on each of these points in more detail:

When it comes to due diligence, this is absolutely critical. You want to inspect not just the property itself, but also research the neighborhood, check comparable sales, and understand the local market conditions.

For negotiation, remember that every deal is different. Sometimes you'll need to be aggressive, other times patient. The key is knowing your numbers inside and out so you can make informed decisions quickly.

Building your team is something many new investors overlook. Having reliable professionals - a good realtor, mortgage broker, contractor, and accountant - can make the difference between success and failure.

Remember, real estate investing is a marathon, not a sprint. Focus on building sustainable wealth over time rather than trying to get rich quick.

For more detailed strategies and advanced techniques, visit WealthyMogul.com where we dive deeper into market analysis, financing strategies, and portfolio optimization.`;
  }
  return script;
}

// Create Instagram-optimized script based on duration
function createInstagramScript(script, title, duration) {
  const keyPoints = extractKeyPoints(script);
  
  if (duration === 30) {
    // 30-second version: Quick highlights
    return `🏠 Ready to master real estate investing? Here are the TOP 3 essentials: 
    
First: ${keyPoints.point1 || 'Always do professional due diligence and get inspections'}
    
Second: ${keyPoints.point2 || 'Never be afraid to negotiate and walk away if numbers don\'t work'}
    
Third: ${keyPoints.point3 || 'Focus on long-term growth and build a strong team'}
    
Follow these proven strategies! Visit WealthyMogul.com for more.`;
  } else {
    // 1-minute version: More detailed explanation
    return `🏠 Ready to master real estate investing? Let me share the essential strategies that actually work:

First: ${keyPoints.point1 || 'Always do professional due diligence. Get inspections, review all documents, and never skip this critical step.'}

Second: ${keyPoints.point2 || 'Master the art of negotiation. Make your offer confidently, but don\'t be afraid to walk away if the numbers don\'t work. There are always more deals.'}

Third: ${keyPoints.point3 || 'Focus on long-term growth and build a strong team. Find a great agent, lender, and property manager. Start small and learn as you go.'}

Avoid common pitfalls like overestimating rental income or letting emotions drive decisions. 

Follow these proven strategies and you'll be on your way to successful real estate investing! Want the complete guide? Visit WealthyMogul.com for more detailed strategies.`;
  }
}

// Extract key points from the full script
function extractKeyPoints(script) {
  const points = {};
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Extract key actionable points
  points.point1 = sentences.find(s => s.includes('due diligence') || s.includes('inspection'))?.trim() || 'Get professional inspections';
  points.point2 = sentences.find(s => s.includes('negotiate') || s.includes('offer'))?.trim() || 'Negotiate confidently';
  points.point3 = sentences.find(s => s.includes('team') || s.includes('growth'))?.trim() || 'Build for long-term success';
  
  return points;
}

// Get platform and duration-specific visual configuration
function getVisualConfig(platform, duration) {
  if (platform === 'instagram') {
    const segments = duration === 30 ? 2 : 3;
    const segmentTime = (duration / segments) * 1000;
    
    return {
      background: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1080&h=1920&fit=crop',
        opacity: 0.4
      },
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&h=800&fit=crop',
          position: 'center',
          size: 'large',
          start_time: 0,
          duration: segmentTime,
          opacity: 0.7
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=800&fit=crop',
          position: 'center',
          size: 'large',
          start_time: segmentTime,
          duration: segmentTime,
          opacity: 0.7
        }
      ].concat(duration === 60 ? [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=800&fit=crop',
        position: 'center',
        size: 'large',
        start_time: segmentTime * 2,
        duration: segmentTime,
        opacity: 0.7
      }] : []),
      overlays: [
        {
          type: 'text',
          text: duration === 30 ? '🏠 TOP 3 REAL ESTATE TIPS' : '🏠 REAL ESTATE INVESTING GUIDE',
          position: 'top_center',
          font_size: 24,
          font_weight: 'bold',
          color: '#ffffff',
          background_color: 'rgba(102, 126, 234, 0.9)',
          padding: 15,
          duration: 3000,
          start_time: 0
        },
        {
          type: 'text',
          text: '💰 Start Your Journey Today!',
          position: 'bottom_center',
          font_size: 20,
          color: '#ffffff',
          background_color: 'rgba(225, 48, 108, 0.9)',
          padding: 10,
          duration: 3000,
          start_time: (duration - 3) * 1000
        }
      ]
    };
  } else {
    // YouTube: Duration-based segments
    const segments = duration <= 120 ? 3 : duration <= 180 ? 4 : 6;
    const segmentDuration = Math.floor(duration / segments);
    
    return {
      background: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop',
        opacity: 0.3
      },
      media: Array.from({ length: segments }, (_, i) => ({
        type: 'image',
        url: [
          'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop'
        ][i % 6],
        position: 'right',
        size: 'medium',
        start_time: i * segmentDuration * 1000,
        duration: segmentDuration * 1000,
        opacity: 0.8
      })),
      overlays: [
        {
          type: 'text',
          text: `${duration/60}min ${title}`,
          position: 'top_center',
          font_size: 28,
          font_weight: 'bold',
          color: '#ffffff',
          background_color: 'rgba(102, 126, 234, 0.9)',
          padding: 15,
          duration: 4000,
          start_time: 0
        },
        {
          type: 'text',
          text: '✓ Professional Strategies\n✓ Proven Methods\n✓ Real Results',
          position: 'bottom_center',
          font_size: 16,
          color: '#ffffff',
          background_color: 'rgba(0,0,0,0.7)',
          padding: 10,
          duration: 4000,
          start_time: (duration - 6) * 1000
        }
      ]
    };
  }
}
