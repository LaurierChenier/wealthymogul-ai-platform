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
      // Return fallback avatars if API fails
      const fallbackAvatars = [
        { id: 'ae573c3333854730a9077d80b53d97e5', name: 'Daisy', display_name: 'Daisy from Wealth Mogul', value: 'daisy_wealth_mogul', type: 'talking_photo' },
        { id: '7f7b982477074c11b8593d0c60690f0a', name: 'Laurier', display_name: 'Laurier from Wealth Mogul', value: 'laurier_wealth_mogul', type: 'talking_photo' },
        { id: 'f379aa769b474121a59c128ebdcee2ad', name: 'Mason', display_name: 'Mason from Wealth Mogul', value: 'mason_wealth_mogul', type: 'talking_photo' }
      ];
      return res.status(200).json({
        success: true,
        avatars: fallbackAvatars,
        total_count: fallbackAvatars.length,
        message: 'Using fallback avatars due to API error',
        fallback: true
      });
    }

    const responseData = await response.json();
    
    if (responseData.error) {
      console.error('❌ HeyGen API Error:', responseData.error);
      // Return fallback avatars if API returns error
      const fallbackAvatars = [
        { id: 'ae573c3333854730a9077d80b53d97e5', name: 'Daisy', display_name: 'Daisy from Wealth Mogul', value: 'daisy_wealth_mogul', type: 'talking_photo' },
        { id: '7f7b982477074c11b8593d0c60690f0a', name: 'Laurier', display_name: 'Laurier from Wealth Mogul', value: 'laurier_wealth_mogul', type: 'talking_photo' },
        { id: 'f379aa769b474121a59c128ebdcee2ad', name: 'Mason', display_name: 'Mason from Wealth Mogul', value: 'mason_wealth_mogul', type: 'talking_photo' }
      ];
      return res.status(200).json({
        success: true,
        avatars: fallbackAvatars,
        total_count: fallbackAvatars.length,
        message: 'Using fallback avatars due to API error',
        fallback: true
      });
    }

    // Process ALL talking photos (custom avatars) - handles future additions automatically
    const customAvatars = [];
    
    // Process talking photos (current AND future custom avatars)
    const talkingPhotos = responseData.talking_photos || [];
    console.log(`📸 Found ${talkingPhotos.length} talking photos in HeyGen account`);
    
    talkingPhotos.forEach(photo => {
      if (photo.talking_photo_id && photo.talking_photo_name) {
        // Create clean value identifier from name
        const cleanName = photo.talking_photo_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        customAvatars.push({
          id: photo.talking_photo_id,
          name: photo.talking_photo_name,
          display_name: `${photo.talking_photo_name} from Wealth Mogul`,
          value: `${cleanName}_wealth_mogul`,
          type: 'talking_photo',
          preview_image: photo.preview_image_url || '',
          created_at: photo.created_at || new Date().toISOString(),
          is_custom: true
        });
      }
    });

    // Process regular avatars (non-premium for fallback)
    const regularAvatars = responseData.avatars || [];
    console.log(`👤 Found ${regularAvatars.length} regular avatars in HeyGen account`);
    
    regularAvatars.forEach(avatar => {
      if (avatar.avatar_id && avatar.avatar_name && !avatar.premium) {
        const cleanName = avatar.avatar_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        customAvatars.push({
          id: avatar.avatar_id,
          name: avatar.avatar_name,
          display_name: avatar.avatar_name,
          value: `${cleanName}_avatar`,
          type: 'avatar',
          preview_image: avatar.preview_image_url || '',
          created_at: avatar.created_at || new Date().toISOString(),
          is_custom: false
        });
      }
    });

    // Sort by custom first, then by creation date (newest first)
    customAvatars.sort((a, b) => {
      // Custom talking photos first
      if (a.is_custom && !b.is_custom) return -1;
      if (!a.is_custom && b.is_custom) return 1;
      
      // Then by creation date (newest first)
      return new Date(b.created_at) - new Date(a.created_at);
    });

    console.log(`✅ Loaded ${customAvatars.length} avatars automatically (${customAvatars.filter(a => a.is_custom).length} custom talking photos)`);

    // Log current custom avatars for debugging
    const customTalkingPhotos = customAvatars.filter(a => a.is_custom);
    console.log('📋 Current custom talking photos:');
    customTalkingPhotos.forEach(avatar => {
      console.log(`   - ${avatar.name} (${avatar.id})`);
    });

    return res.status(200).json({
      success: true,
      avatars: customAvatars,
      total_count: customAvatars.length,
      custom_talking_photos: customTalkingPhotos.length,
      regular_avatars: customAvatars.length - customTalkingPhotos.length,
      message: `Successfully loaded ${customAvatars.length} avatars (${customTalkingPhotos.length} custom talking photos)`,
      automatic: true,
      future_compatible: true, // Handles future custom avatars automatically
      last_updated: new Date().toISOString(),
      fallback: false
    });

  } catch (error) {
    console.error('💥 Avatar Loading Error:', error);
    
    // Return fallback avatars on any error
    const fallbackAvatars = [
      { id: 'ae573c3333854730a9077d80b53d97e5', name: 'Daisy', display_name: 'Daisy from Wealth Mogul', value: 'daisy_wealth_mogul', type: 'talking_photo' },
      { id: '7f7b982477074c11b8593d0c60690f0a', name: 'Laurier', display_name: 'Laurier from Wealth Mogul', value: 'laurier_wealth_mogul', type: 'talking_photo' },
      { id: 'f379aa769b474121a59c128ebdcee2ad', name: 'Mason', display_name: 'Mason from Wealth Mogul', value: 'mason_wealth_mogul', type: 'talking_photo' }
    ];
    
    return res.status(200).json({
      success: true,
      avatars: fallbackAvatars,
      total_count: fallbackAvatars.length,
      message: 'Using fallback avatars due to system error',
      fallback: true,
      error_details: error.message
    });
  }
}
