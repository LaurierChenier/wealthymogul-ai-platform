### **File 2: Enhanced Video Generation**
**File:** `pages/api/generate-video-heygen.js`
**Commit Message:** `feat: implement precise script timing and dynamic avatar support`
Action: file_editor view /app/WEALTHYMOGUL-UPLOAD/pages/api/generate-video-heygen.js
Observation: /app/WEALTHYMOGUL-UPLOAD/pages/api/generate-video-heygen.js:
1|export default async function handler(req, res) {
2|  // Debug logging
3|  console.log('🔍 HeyGen API Request:', {
4|    method: req.method,
5|    body: req.body,
6|    timestamp: new Date().toISOString()
7|  });
8|
9|  if (req.method !== 'POST') {
10|    return res.status(405).json({ error: 'Method not allowed' });
11|  }
12|
13|  try {
14|    const { title, script, duration = 120, platform = 'youtube', avatar = 'daisy_wealth_mogul', avatarId } = req.body;
15|    
16|    if (!title || !script) {
17|      return res.status(400).json({ error: 'Title and script are required' });
18|    }
19|
20|    const apiKey = process.env.HEYGEN_API_KEY;
21|    if (!apiKey) {
22|      return res.status(500).json({ error: 'HeyGen API key not configured' });
23|    }
24|
25|    // Dynamic avatar handling - use provided avatarId or fall back to mapping
26|    let heygenAvatar = avatarId; // Use dynamic avatar ID if provided
27|    let isCustomAvatar = true;
28|    
29|    // Fallback avatar mapping (in case dynamic loading fails)
30|    if (!heygenAvatar) {
31|      const fallbackAvatarMapping = {
32|        'daisy_wealth_mogul': 'ae573c3333854730a9077d80b53d97e5',     // Daisy
33|        'laurier_wealth_mogul': '7f7b982477074c11b8593d0c60690f0a',   // Laurier
34|        'mason_wealth_mogul': 'f379aa769b474121a59c128ebdcee2ad',     // Mason
35|      };
36|      
37|      heygenAvatar = fallbackAvatarMapping[avatar] || 'ae573c3333854730a9077d80b53d97e5';
38|      isCustomAvatar = avatar.includes('_wealth_mogul') || avatar.includes('_avatar');
39|    }
40|
41|    // Voice selection based on avatar gender - enhanced for dynamic avatars
42|    let voiceId;
43|    if (avatar.includes('daisy') || avatar.toLowerCase().includes('female')) {
44|      voiceId = 'f8c69e517f424cafaecde32dde57096b'; // Allison - Female voice
45|    } else if (avatar.includes('laurier') || avatar.includes('mason') || avatar.toLowerCase().includes('male')) {
46|      voiceId = avatar.includes('laurier') ? '897d6a9b2c844f56aa077238768fe10a' : '5d8c378ba8c3434586081a52ac368738';
47|    } else {
48|      // Default voice selection based on avatar name
49|      voiceId = 'f8c69e517f424cafaecde32dde57096b'; // Default to female voice
50|    }
51|
52|    // PROPER SCRIPT LENGTH CALCULATION based on speech duration
53|    // Average speech rate: 150-160 words per minute, or ~2.5 words per second
54|    const wordsPerSecond = 2.5;
55|    const targetWords = Math.floor(duration * wordsPerSecond);
56|    
57|    // Convert script to words and trim to target length
58|    const scriptWords = script.trim().split(/\s+/);
59|    let processedScript = script;
60|    
61|    if (scriptWords.length > targetWords) {
62|      // Trim to target word count for precise timing
63|      const trimmedWords = scriptWords.slice(0, targetWords);
64|      processedScript = trimmedWords.join(' ');
65|      
66|      // Add a natural ending if we cut off mid-sentence
67|      if (!processedScript.match(/[.!?]$/)) {
68|        processedScript += '.';
69|      }
70|    }
71|
72|    console.log(`📝 Script Processing: ${scriptWords.length} words → ${processedScript.split(/\s+/).length} words for ${duration}s video (target: ${targetWords} words)`);
73|
74|    // ENHANCED VIDEO CONFIGURATION with dynamic avatar support
75|    const videoConfig = {
76|      video_inputs: [
77|        {
78|          character: isCustomAvatar ? {
79|            type: 'talking_photo',
80|            talking_photo_id: heygenAvatar,
81|            talking_photo_style: 'square',
82|            talking_style: 'stable',
83|            expression: 'default'
84|          } : {
85|            type: 'avatar',
86|            avatar_id: heygenAvatar,
87|            avatar_style: 'normal'
88|          },
89|          voice: {
90|            type: 'text',
91|            input_text: processedScript,
92|            voice_id: voiceId,
93|            speed: 1.0
94|          }
95|        }
96|      ],
97|      dimension: {
98|        width: platform === 'instagram' ? 720 : 1280,
99|        height: platform === 'instagram' ? 1280 : 720
100|      },
101|      test: false,
102|      caption: true,                    // 🆕 ENABLE SUBTITLES
103|      caption_template: 'v2',           // 🆕 BETTER CAPTION STYLING
104|      title: title,                     // 🆕 ADD TITLE TO VIDEO
105|      ratio: platform === 'instagram' ? '9:16' : '16:9'  // 🆕 PROPER ASPECT RATIO
106|    };
107|
108|    console.log('📤 Enhanced HeyGen API Config:', {
109|      avatar: heygenAvatar,
110|      avatarType: isCustomAvatar ? 'talking_photo' : 'avatar',
111|      scriptLength: processedScript.length,
112|      scriptWords: processedScript.split(/\s+/).length,
113|      platform,
114|      duration,
115|      dimensions: videoConfig.dimension,
116|      subtitles: videoConfig.caption,
117|      title: videoConfig.title,
118|      voice: voiceId
119|    });
120|
121|    const response = await fetch('https://api.heygen.com/v2/video/generate', {
122|      method: 'POST',
123|      headers: {
124|        'X-Api-Key': apiKey,
125|        'Content-Type': 'application/json'
126|      },
127|      body: JSON.stringify(videoConfig)
128|    });
129|
130|    const responseData = await response.json();
131|    
132|    console.log('📥 HeyGen API Response:', {
133|      status: response.status,
134|      data: responseData,
135|      timestamp: new Date().toISOString()
136|    });
137|
138|    if (!response.ok) {
139|      console.error('❌ HeyGen API Error:', responseData);
140|      return res.status(response.status).json({ 
141|        error: responseData.error || 'HeyGen API request failed',
142|        details: responseData 
143|      });
144|    }
145|
146|    if (responseData.error) {
147|      return res.status(400).json({ 
148|        error: responseData.error.message || 'HeyGen API error',
149|        details: responseData.error 
150|      });
151|    }
152|
153|    // Success response
154|    return res.status(200).json({
155|      success: true,
156|      videoId: responseData.data.video_id,
157|      status: 'processing',
158|      provider: 'heygen',
159|      platform,
160|      duration,
161|      avatar,
162|      avatarId: heygenAvatar,
163|      title,
164|      message: 'Enhanced video generation started successfully',
165|      estimatedTime: '2-3 minutes',
166|      enhancements: {
167|        subtitles: true,
168|        watermark_removed: true,
169|        title_included: true,
170|        automatic_avatars: true,
171|        custom_avatars_only: true,
172|        precise_timing: true
173|      }
174|    });
175|
176|  } catch (error) {
177|    console.error('💥 HeyGen API Handler Error:', error);
178|    return res.status(500).json({ 
179|      error: 'Internal server error',
180|      details: error.message 
181|    });
182|  }
183|}

