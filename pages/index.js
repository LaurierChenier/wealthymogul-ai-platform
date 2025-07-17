1|import { useState, useEffect } from 'react';
2|
3|export default function HomePage() {
4|  const [topic, setTopic] = useState('');
5|  const [isGenerating, setIsGenerating] = useState(false);
6|  const [generatedVideo, setGeneratedVideo] = useState(null);
7|  const [videoGeneration, setVideoGeneration] = useState(null);
8|  const [isRetrieving, setIsRetrieving] = useState(false);
9|  const [editedScript, setEditedScript] = useState('');
10|  const [useOwnScript, setUseOwnScript] = useState(false);
11|  const [youtubeLength, setYoutubeLength] = useState(120); // Default 2 minutes
12|  const [instagramLength, setInstagramLength] = useState(30); // Default 30 seconds
13|  const [selectedAvatar, setSelectedAvatar] = useState(''); // Will be set after loading
14|  const [availableAvatars, setAvailableAvatars] = useState([]);
15|  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);
16|
17|  // 🆕 AUTOMATIC AVATAR LOADING
18|  useEffect(() => {
19|    const loadAvatars = async () => {
20|      try {
21|        console.log('🔄 Loading avatars automatically...');
22|        const response = await fetch('/api/load-avatars');
23|        const result = await response.json();
24|        
25|        if (result.success && result.avatars.length > 0) {
26|          setAvailableAvatars(result.avatars);
27|          // Set default avatar to first available one
28|          setSelectedAvatar(result.avatars[0].value);
29|          console.log(`✅ Loaded ${result.avatars.length} avatars automatically`);
30|        } else {
31|          console.error('❌ Failed to load avatars:', result.error);
32|          // Fallback to hardcoded avatars if API fails
33|          const fallbackAvatars = [
34|            { id: 'ae573c3333854730a9077d80b53d97e5', name: 'Daisy', display_name: 'Daisy from Wealth Mogul', value: 'daisy_wealth_mogul', type: 'talking_photo' },
35|            { id: '7f7b982477074c11b8593d0c60690f0a', name: 'Laurier', display_name: 'Laurier from Wealth Mogul', value: 'laurier_wealth_mogul', type: 'talking_photo' },
36|            { id: 'f379aa769b474121a59c128ebdcee2ad', name: 'Mason', display_name: 'Mason from Wealth Mogul', value: 'mason_wealth_mogul', type: 'talking_photo' }
37|          ];
38|          setAvailableAvatars(fallbackAvatars);
39|          setSelectedAvatar('daisy_wealth_mogul');
40|        }
41|      } catch (error) {
42|        console.error('💥 Avatar loading failed:', error);
43|        // Use fallback avatars
44|        const fallbackAvatars = [
45|          { id: 'ae573c3333854730a9077d80b53d97e5', name: 'Daisy', display_name: 'Daisy from Wealth Mogul', value: 'daisy_wealth_mogul', type: 'talking_photo' },
46|          { id: '7f7b982477074c11b8593d0c60690f0a', name: 'Laurier', display_name: 'Laurier from Wealth Mogul', value: 'laurier_wealth_mogul', type: 'talking_photo' },
47|          { id: 'f379aa769b474121a59c128ebdcee2ad', name: 'Mason', display_name: 'Mason from Wealth Mogul', value: 'mason_wealth_mogul', type: 'talking_photo' }
48|        ];
49|        setAvailableAvatars(fallbackAvatars);
50|        setSelectedAvatar('daisy_wealth_mogul');

