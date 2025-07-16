// Enhanced Synthesia AI Avatar Video with Platform-Specific Content
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

    // Create platform-specific content
    let optimizedScript = script;
    let videoTitle = title;
    
    if (platform === 'instagram') {
      // Create Instagram-optimized 30-second script
      optimizedScript = createInstagramScript(script, title);
      videoTitle = `${title} - Quick Tips`;
    }

    // Platform-specific visual configurations
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

    console.log(`Creating ${platform} optimized video with ${platform === 'instagram' ? 'condensed' : 'full'} content`);

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
    console.log(`${platform} optimized video created:`, result);

    // Return the video ID for status checking
    return res.status(200).json({
      success: true,
      videoId: result.id,
      status: 'pending',
      message: `${platform === 'youtube' ? '2-minute' : '30-second'} ${platform} optimized AI avatar video started`,
      provider: 'synthesia',
      platform: platform,
      avatar: 'sonia_costume1_cameraA',
      voice: 'en-US-JennyNeural',
      estimatedTime: '3-5 minutes',
      features: ['platform_optimized', 'real_estate_visuals', 'title_overlay', 'subtitles', 'logo', 'watermark'],
      contentType: platform === 'instagram' ? 'condensed_highlights' : 'full_content'
    });

  } catch (error) {
    console.error('Error in platform-optimized video generation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate platform-optimized video',
      details: error.message,
      errorType: error.constructor.name
    });
  }
}

// Create Instagram-optimized 30-second script
function createInstagramScript(fullScript, title) {
  // Extract key points and create a concise 30-second version
  const keyPoints = extractKeyPoints(fullScript);
  
  return `Ready to master real estate investing? Here are the TOP 3 essentials: 
  
First: ${keyPoints.point1 || 'Always do professional due diligence and get inspections'}
  
Second: ${keyPoints.point2 || 'Never be afraid to negotiate and walk away if numbers don\'t work'}
  
Third: ${keyPoints.point3 || 'Focus on long-term growth and build a strong team'}
  
Follow these proven strategies and you'll be on your way to successful real estate investing! 

Want the complete guide? Visit WealthyMogul.com for more detailed strategies.`;
}

// Extract key points from the full script
function extractKeyPoints(script) {
  const points = {};
  
  // Look for numbered points or key phrases
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Extract key actionable points
  points.point1 = sentences.find(s => s.includes('due diligence') || s.includes('inspection'))?.trim() || 'Get professional inspections';
  points.point2 = sentences.find(s => s.includes('negotiate') || s.includes('offer'))?.trim() || 'Negotiate confidently';
  points.point3 = sentences.find(s => s.includes('team') || s.includes('growth'))?.trim() || 'Build for long-term success';
  
  return points;
}

// Get platform-specific visual configuration
function getVisualConfig(platform, duration) {
  if (platform === 'instagram') {
    // Instagram: Fast-paced, engaging visuals
    return {
      background: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1080&h=1920&fit=crop', // Vertical format
        opacity: 0.4
      },
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&h=800&fit=crop',
          position: 'center',
          size: 'large',
          start_time: 0,
          duration: 10000,
          opacity: 0.7
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=800&fit=crop',
          position: 'center',
          size: 'large',
          start_time: 10000,
          duration: 10000,
          opacity: 0.7
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=800&fit=crop',
          position: 'center',
          size: 'large',
          start_time: 20000,
          duration: 10000,
          opacity: 0.7
        }
      ],
      overlays: [
        {
          type: 'text',
          text: '🏠 TOP 3 REAL ESTATE TIPS',
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
          background_color: 'rgba(225, 48, 108, 0.9)', // Instagram pink
          padding: 10,
          duration: 3000,
          start_time: 27000
        }
      ]
    };
  } else {
    // YouTube: Detailed, professional visuals
    const segmentDuration = Math.floor(duration / 4);
    return {
      background: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop',
        opacity: 0.3
      },
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&h=600&fit=crop',
          position: 'right',
          size: 'medium',
          start_time: 0,
          duration: segmentDuration * 1000,
          opacity: 0.8
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
          position: 'right',
          size: 'medium',
          start_time: segmentDuration * 1000,
          duration: segmentDuration * 1000,
          opacity: 0.8
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=600&fit=crop',
          position: 'right',
          size: 'medium',
          start_time: segmentDuration * 2000,
          duration: segmentDuration * 1000,
          opacity: 0.8
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop',
          position: 'right',
          size: 'medium',
          start_time: segmentDuration * 3000,
          duration: segmentDuration * 1000,
          opacity: 0.8
        }
      ],
      overlays: [
        {
          type: 'text',
          text: title,
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
          text: '✓ Professional Due Diligence\n✓ Smart Negotiation\n✓ Long-term Growth Focus',
          position: 'bottom_center',
          font_size: 16,
          color: '#ffffff',
          background_color: 'rgba(0,0,0,0.7)',
          padding: 10,
          duration: 3000,
          start_time: (duration - 5) * 1000
        }
      ]
    };
  }
}
