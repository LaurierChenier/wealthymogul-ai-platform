export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    console.log('🔍 Loading avatars automatically from HeyGen...');

    // Fetch avatars from HeyGen API v2
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ HeyGen Avatar API Error:', response.status);
      return res.status(response.status).json({ 
        error: 'Failed to load avatars from HeyGen',
        details: `HTTP ${response.status}`
      });
    }

    const responseData = await response.json();
    
    if (responseData.error) {
      return res.status(400).json({ 
        error: responseData.error.message || 'HeyGen avatar API error',
        details: responseData.error 
      });
    }

    // Process talking photos (custom avatars) and regular avatars
    const customAvatars = [];
    
    // Process talking photos (your custom avatars)
    const talkingPhotos = responseData.talking_photos || [];
    talkingPhotos.forEach(photo => {
      if (photo.talking_photo_id && photo.talking_photo_name) {
        customAvatars.push({
          id: photo.talking_photo_id,
          name: photo.talking_photo_name,
          display_name: `${photo.talking_photo_name} from Wealth Mogul`,
          value: `${photo.talking_photo_name.toLowerCase()}_wealth_mogul`,
          type: 'talking_photo',
          preview_image: photo.preview_image_url || ''
        });
      }
    });

    // Process regular avatars (if any are useful)
    const regularAvatars = responseData.avatars || [];
    regularAvatars.forEach(avatar => {
      if (avatar.avatar_id && avatar.avatar_name && !avatar.premium) {
        customAvatars.push({
          id: avatar.avatar_id,
          name: avatar.avatar_name,
          display_name: avatar.avatar_name,
          value: `${avatar.avatar_name.toLowerCase().replace(/\s+/g, '_')}_avatar`,
          type: 'avatar',
          preview_image: avatar.preview_image_url || ''
        });
      }
    });

    console.log(`✅ Loaded ${customAvatars.length} avatars automatically`);

    return res.status(200).json({
      success: true,
      avatars: customAvatars,
      total_count: customAvatars.length,
      message: `Successfully loaded ${customAvatars.length} avatars`,
      automatic: true
    });

  } catch (error) {
    console.error('💥 Avatar Loading Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
