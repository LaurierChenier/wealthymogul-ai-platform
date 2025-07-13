export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ error: 'Search query required' });
  }

  try {
    // Test YouTube Data API v3
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(search)}&type=channel&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`YouTube API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Format results for display
    const channels = data.items?.map(item => ({
      channelId: item.id?.channelId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.default?.url,
      publishedAt: item.snippet?.publishedAt
    })) || [];

    res.status(200).json({
      success: true,
      searchQuery: search,
      channelCount: channels.length,
      channels: channels,
      apiTest: {
        hasApiKey: !!process.env.YOUTUBE_API_KEY,
        keyStart: process.env.YOUTUBE_API_KEY?.substring(0, 10),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('YouTube API test error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      hasApiKey: !!process.env.YOUTUBE_API_KEY
    });
  }
}
