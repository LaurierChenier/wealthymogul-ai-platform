## **📁 FILES WITH INDIVIDUAL COMMIT MESSAGES**

### **File 1: New Avatar Detection System**
**File:** `pages/api/load-avatars.js`
**Commit Message:** `feat: add automatic avatar detection system for future custom talking photos`
Action: file_editor view /app/WEALTHYMOGUL-UPLOAD/pages/api/load-avatars.js
Observation: /app/WEALTHYMOGUL-UPLOAD/pages/api/load-avatars.js:
1|export default async function handler(req, res) {
2|  if (req.method !== 'GET') {
3|    return res.status(405).json({ error: 'Method not allowed' });
4|  }
5|
6|  try {
7|    const apiKey = process.env.HEYGEN_API_KEY;
8|    if (!apiKey) {
9|      return res.status(500).json({ error: 'HeyGen API key not configured' });
10|    }
11|
12|    console.log('🔍 Loading avatars automatically from HeyGen...');
13|
14|    // Fetch avatars from HeyGen API v2
15|    const response = await fetch('https://api.heygen.com/v2/avatars', {
16|      method: 'GET',
17|      headers: {
18|        'X-Api-Key': apiKey,
19|        'Accept': 'application/json'
20|      }
21|    });
22|
23|    if (!response.ok) {
24|      console.error('❌ HeyGen Avatar API Error:', response.status);
25|      return res.status(response.status).json({ 
26|        error: 'Failed to load avatars from HeyGen',
27|        details: `HTTP ${response.status}`
28|      });
29|    }
30|
31|    const responseData = await response.json();
32|    
33|    if (responseData.error) {
34|      return res.status(400).json({ 
35|        error: responseData.error.message || 'HeyGen avatar API error',
36|        details: responseData.error 
37|      });
38|    }
39|
40|    // Process ALL talking photos (custom avatars) - this handles future additions automatically
41|    const customAvatars = [];
42|    
43|    // Process talking photos (your current AND future custom avatars)
44|    const talkingPhotos = responseData.talking_photos || [];
45|    console.log(`📸 Found ${talkingPhotos.length} talking photos in HeyGen account`);
46|    
47|    talkingPhotos.forEach(photo => {
48|      if (photo.talking_photo_id && photo.talking_photo_name) {
49|        // Create a clean value identifier from the name
50|        const cleanName = photo.talking_photo_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
51|        
52|        customAvatars.push({
53|          id: photo.talking_photo_id,
54|          name: photo.talking_photo_name,
55|          display_name: `${photo.talking_photo_name} from Wealth Mogul`,
56|          value: `${cleanName}_wealth_mogul`,
57|          type: 'talking_photo',
58|          preview_image: photo.preview_image_url || '',
59|          created_at: photo.created_at || new Date().toISOString(),
60|          is_custom: true
61|        });
62|      }
63|    });
64|
65|    // Process regular avatars (non-premium only for fallback)
66|    const regularAvatars = responseData.avatars || [];
67|    console.log(`👤 Found ${regularAvatars.length} regular avatars in HeyGen account`);
68|    
69|    regularAvatars.forEach(avatar => {
70|      if (avatar.avatar_id && avatar.avatar_name && !avatar.premium) {
71|        const cleanName = avatar.avatar_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
72|        
73|        customAvatars.push({
74|          id: avatar.avatar_id,
75|          name: avatar.avatar_name,
76|          display_name: avatar.avatar_name,
77|          value: `${cleanName}_avatar`,
78|          type: 'avatar',
79|          preview_image: avatar.preview_image_url || '',
80|          created_at: avatar.created_at || new Date().toISOString(),
81|          is_custom: false
82|        });
83|      }
84|    });
85|
86|    // Sort by creation date (newest first) and custom avatars first
87|    customAvatars.sort((a, b) => {
88|      // Custom talking photos first
89|      if (a.is_custom && !b.is_custom) return -1;
90|      if (!a.is_custom && b.is_custom) return 1;
91|      
92|      // Then by creation date (newest first)
93|      return new Date(b.created_at) - new Date(a.created_at);
94|    });
95|
96|    console.log(`✅ Loaded ${customAvatars.length} avatars automatically (${customAvatars.filter(a => a.is_custom).length} custom talking photos)`);
97|
98|    // Log current custom avatars for debugging
99|    const customTalkingPhotos = customAvatars.filter(a => a.is_custom);
100|    console.log('📋 Current custom talking photos:');
101|    customTalkingPhotos.forEach(avatar => {
102|      console.log(`   - ${avatar.name} (${avatar.id})`);
103|    });
104|
105|    return res.status(200).json({
106|      success: true,
107|      avatars: customAvatars,
108|      total_count: customAvatars.length,
109|      custom_talking_photos: customTalkingPhotos.length,
110|      regular_avatars: customAvatars.length - customTalkingPhotos.length,
111|      message: `Successfully loaded ${customAvatars.length} avatars (${customTalkingPhotos.length} custom talking photos)`,
112|      automatic: true,
113|      future_compatible: true, // 🆕 Indicates system handles future additions
114|      last_updated: new Date().toISOString()
115|    });
116|
117|  } catch (error) {
118|    console.error('💥 Avatar Loading Error:', error);
119|    return res.status(500).json({ 
120|      error: 'Internal server error',
121|      details: error.message 
122|    });
123|  }
124|}

