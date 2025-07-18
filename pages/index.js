import { useState, useEffect } from 'react';

export default function EnhancedVideoGenerator() {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [duration, setDuration] = useState(120);
  const [scriptMode, setScriptMode] = useState('ai');
  const [customTitle, setCustomTitle] = useState('');

  // Avatar states
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loadingAvatars, setLoadingAvatars] = useState(true);

  // Graphics states
  const [graphicsPrompt, setGraphicsPrompt] = useState('');
  const [useGraphics, setUseGraphics] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [savedImages, setSavedImages] = useState([]);
  const [selectedSavedImage, setSelectedSavedImage] = useState(null);
  const [showImageLibrary, setShowImageLibrary] = useState(false);

  // Video states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [error, setError] = useState(null);

  // Video status states
  const [videoId, setVideoId] = useState('');
  const [videoStatus, setVideoStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Load avatars and saved images on component mount
  useEffect(() => {
    loadAvatars();
    loadSavedImages();
  }, []);

  const loadAvatars = async () => {
    try {
      const response = await fetch('/api/heygen-avatars');
      const data = await response.json();
      
      if (response.ok) {
        const allAvatars = [
          ...(data.custom || []),
          ...(data.public || [])
        ];
        setAvatars(allAvatars);
        if (allAvatars.length > 0) {
          setSelectedAvatar(allAvatars[0]);
        }
      } else {
        setError({ code: 'AVATAR_LOAD_ERROR', message: 'Failed to load avatars.' });
      }
    } catch (error) {
      setError({ code: 'NETWORK_ERROR', message: 'Failed to connect to avatar service.' });
    } finally {
      setLoadingAvatars(false);
    }
  };

  const loadSavedImages = () => {
    const saved = localStorage.getItem('wealthymogul_saved_images');
    if (saved) {
      setSavedImages(JSON.parse(saved));
    }
  };

  const pickRandomAvatar = () => {
    if (avatars.length === 0) return;
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    setSelectedAvatar(randomAvatar);
  };

  const saveImageToLibrary = (imageUrl, prompt) => {
    const newImage = {
      id: Date.now(),
      url: imageUrl,
      prompt: prompt,
      createdAt: new Date().toISOString()
    };
    const updated = [...savedImages, newImage];
    setSavedImages(updated);
    localStorage.setItem('wealthymogul_saved_images', JSON.stringify(updated));
  };

  const deleteImageFromLibrary = (imageId) => {
    const updated = savedImages.filter(img => img.id !== imageId);
    setSavedImages(updated);
    localStorage.setItem('wealthymogul_saved_images', JSON.stringify(updated));
  };

  const generateContent = async () => {
    if (!topic.trim()) {
      setError({ code: 'TOPIC_REQUIRED', message: 'Please enter a topic.' });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();

      if (response.ok) {
        setScript(data.script);
        setTitle(data.title);
        setDescription(data.description);
        setTags(data.tags);

        // Auto-generate graphics prompt based on the topic
        const autoGraphicsPrompt = `Professional infographic about ${topic}, clean modern design, real estate themed, educational style`;
        setGraphicsPrompt(autoGraphicsPrompt);
      } else {
        setError(data);
      }
    } catch (error) {
      setError({ code: 'NETWORK_ERROR', message: 'Network error occurred.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!graphicsPrompt.trim()) {
      setError({ code: 'GRAPHICS_PROMPT_REQUIRED', message: 'Please enter a graphics prompt.' });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: graphicsPrompt,
          platform: platform
        })
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        saveImageToLibrary(data.imageUrl, graphicsPrompt);
      } else {
        setError(data);
      }
    } catch (error) {
      setError({ code: 'NETWORK_ERROR', message: 'Network error occurred.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (!script.trim() || !(scriptMode === 'custom' ? customTitle.trim() : title.trim())) {
      setError({ code: 'SCRIPT_TITLE_REQUIRED', message: 'Script and title are required.' });
      return;
    }

    if (!selectedAvatar) {
      setError({ code: 'AVATAR_REQUIRED', message: 'Please select an avatar.' });
      return;
    }

    setIsGeneratingVideo(true);
    setError(null);
    setVideoResult(null);

    try {
      const finalImageUrl = selectedSavedImage?.url || generatedImage;
      
      const response = await fetch('/api/generate-image-and-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scriptMode === 'custom' ? customTitle : title,
          script,
          duration,
          platform,
          avatar: selectedAvatar,
          graphicsPrompt,
          useGraphics: useGraphics && finalImageUrl,
          backgroundImageUrl: finalImageUrl
        })
      });

      const data = await response.json();

      if (response.ok) {
        setVideoResult(data);
        setVideoId(data.videoId); // Auto-populate video ID for status checking
      } else {
        setError(data);
      }
    } catch (error) {
      setError({ code: 'NETWORK_ERROR', message: 'Network error occurred.' });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const checkVideoStatus = async () => {
    if (!videoId.trim()) {
      setError({ code: 'VIDEO_ID_REQUIRED', message: 'Please enter a video ID.' });
      return;
    }

    setCheckingStatus(true);
    setVideoStatus(null);
    setError(null);

    try {
      const response = await fetch(`/api/check-video-status?videoId=${videoId}`);
      const data = await response.json();

      if (response.ok) {
        setVideoStatus(data);
      } else {
        setError(data);
      }
    } catch (error) {
      setError({ code: 'NETWORK_ERROR', message: 'Failed to check video status.' });
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>WealthyMogul.com</h1>
      <p>AI-Powered Wealth Building Content Platform</p>

      {/* Script Mode Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Choose Script Mode:</h3>
        <button 
          onClick={() => setScriptMode('ai')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: scriptMode === 'ai' ? '#007bff' : '#f8f9fa',
            color: scriptMode === 'ai' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}
        >
          AI Generated Script
        </button>
        <button 
          onClick={() => setScriptMode('custom')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: scriptMode === 'custom' ? '#007bff' : '#f8f9fa',
            color: scriptMode === 'custom' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}
        >
          My Own Script
        </button>
      </div>

      {/* AI Content Generation */}
      {scriptMode === 'ai' && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>AI Video Generator</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>Topic:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your wealth building topic..."
              style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <button 
            onClick={generateContent}
            disabled={isGenerating}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
      )}

      {/* Custom Script Mode */}
      {scriptMode === 'custom' && (
        <div style={{ marginBottom: '20px' }}>
          <label>Custom Title:</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Enter your video title..."
            style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <label style={{ marginTop: '15px', display: 'block' }}>Custom Script:</label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste or write your video script here..."
            style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '200px' }}
          />
        </div>
      )}

      {/* Avatar Selection */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
        <h3>🎭 Avatar Selection</h3>
        {loadingAvatars ? (
          <p>Loading avatars...</p>
        ) : (
          <div style={{ marginBottom: '15px' }}>
            <label>Choose Avatar:</label>
            <select
              value={selectedAvatar?.id || ''}
              onChange={(e) => {
                const found = avatars.find(a => a.id === e.target.value);
                setSelectedAvatar(found);
              }}
              style={{ width: '70%', padding: '8px', marginTop: '5px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              {avatars.map((avatar) => (
                <option key={avatar.id} value={avatar.id}>
                  {avatar.name || avatar.display_name || avatar.value || avatar.id}
                  {avatar.type && ` (${avatar.type})`}
                </option>
              ))}
            </select>
            <button 
              onClick={pickRandomAvatar}
              disabled={avatars.length === 0}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6f42c1', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: avatars.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              🎲 Random Avatar
            </button>
          </div>
        )}
        {selectedAvatar && (
          <div style={{ padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
            <strong>Selected:</strong> {selectedAvatar.name || selectedAvatar.display_name || selectedAvatar.value || selectedAvatar.id}
            {selectedAvatar.preview_image_url && (
              <img 
                src={selectedAvatar.preview_image_url} 
                alt="Avatar preview" 
                style={{ width: '60px', height: '60px', borderRadius: '50%', marginLeft: '10px', objectFit: 'cover' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Graphics Generation Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3>🎨 Graphics & Backgrounds</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={useGraphics}
              onChange={(e) => setUseGraphics(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Use custom graphics/background
          </label>
        </div>

        {useGraphics && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label>Graphics Prompt:</label>
              <textarea
                value={graphicsPrompt}
                onChange={(e) => setGraphicsPrompt(e.target.value)}
                placeholder="Describe the image/background you want (e.g., 'Professional infographic showing 5 ways to invest in real estate, modern clean design')"
                style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <button 
                onClick={generateImage}
                disabled={isGenerating}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#17a2b8', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  marginRight: '10px',
                  cursor: isGenerating ? 'not-allowed' : 'pointer'
                }}
              >
                {isGenerating ? 'Generating Image...' : 'Generate Image'}
              </button>

              <button 
                onClick={() => setShowImageLibrary(!showImageLibrary)}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {showImageLibrary ? 'Hide' : 'Show'} Image Library ({savedImages.length})
              </button>
            </div>

            {/* Generated Image Preview */}
            {generatedImage && (
              <div style={{ marginBottom: '15px' }}>
                <h4>Generated Image:</h4>
                <img 
                  src={generatedImage} 
                  alt="Generated graphics" 
                  style={{ maxWidth: '300px', maxHeight: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            )}

            {/* Image Library */}
            {showImageLibrary && (
              <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}>
                <h4>Saved Images Library:</h4>
                {savedImages.length === 0 ? (
                  <p>No saved images yet. Generate some images to build your library!</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {savedImages.map((image) => (
                      <div key={image.id} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                        <img 
                          src={image.url} 
                          alt={image.prompt} 
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                        />
                        <p style={{ fontSize: '12px', margin: '5px 0', color: '#666' }}>
                          {image.prompt.substring(0, 50)}...
                        </p>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => {
                              setSelectedSavedImage(image);
                              setGeneratedImage(image.url);
                            }}
                            style={{ 
                              padding: '5px 10px', 
                              backgroundColor: selectedSavedImage?.id === image.id ? '#28a745' : '#007bff', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '3px', 
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            {selectedSavedImage?.id === image.id ? 'Selected' : 'Use'}
                          </button>
                          <button
                            onClick={() => deleteImageFromLibrary(image.id)}
                            style={{ 
                              padding: '5px 10px', 
                              backgroundColor: '#dc3545', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '3px', 
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Script Editor */}
      {script && (
        <div style={{ marginBottom: '20px' }}>
          <label>Script:</label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '200px' }}
          />
        </div>
      )}

      {/* Video Configuration */}
      <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div>
          <label>Platform:</label>
          <select 
            value={platform} 
            onChange={(e) => setPlatform(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="youtube">YouTube (16:9)</option>
            <option value="instagram">Instagram (9:16)</option>
          </select>
        </div>

        <div>
          <label>Duration:</label>
          <select 
            value={duration} 
            onChange={(e) => setDuration(parseInt(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
            <option value={180}>3 minutes</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>
      </div>

      {/* Generate Video Button */}
      <button 
        onClick={generateVideo}
        disabled={isGeneratingVideo || !script.trim() || !selectedAvatar}
        style={{ 
          padding: '15px 30px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          fontSize: '16px',
          cursor: isGeneratingVideo || !script.trim() || !selectedAvatar ? 'not-allowed' : 'pointer',
          width: '100%',
          marginBottom: '20px'
        }}
      >
        {isGeneratingVideo ? 'Generating Video...' : 'Generate Video'}
      </button>

      {/* Video Status Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
        <h3>📹 Check Video Status</h3>
        <div style={{ marginBottom: '15px' }}>
          <label>Video ID:</label>
          <input
            type="text"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="Enter HeyGen video ID (e.g., e1fcd9d9d7fd4ddf925eee8063dae0bc)"
            style={{ width: '70%', padding: '10px', marginTop: '5px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button 
            onClick={checkVideoStatus}
            disabled={checkingStatus || !videoId.trim()}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#ffc107', 
              color: 'black', 
              border: 'none', 
              borderRadius: '5px',
              cursor: checkingStatus || !videoId.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {checkingStatus ? 'Checking...' : 'Check Status'}
          </button>
        </div>

        {videoStatus && (
          <div style={{ padding: '15px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '4px' }}>
            <h4>Video Status:</h4>
            <p><strong>Status:</strong> {videoStatus.data?.status || 'Unknown'}</p>
            <p><strong>Progress:</strong> {videoStatus.data?.progress || 'N/A'}</p>
            {videoStatus.data?.video_url && (
              <div>
                <p><strong>Download Link:</strong></p>
                <a 
                  href={videoStatus.data.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block', 
                    padding: '10px 20px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '5px' 
                  }}
                >
                  Download Video
                </a>
              </div>
            )}
            <details style={{ marginTop: '10px' }}>
              <summary>Full Response</summary>
              <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(videoStatus, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>{error.code || 'ERROR'}:</strong> {error.message || (typeof error === 'string' ? error : JSON.stringify(error))}
        </div>
      )}

      {/* Video Result */}
      {videoResult && (
        <div style={{ padding: '20px', backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '5px' }}>
          <h3>Video Generated Successfully!</h3>
          <p>Video ID: {videoResult.videoId}</p>
          <p>Status: {videoResult.status}</p>
          {videoResult.backgroundImage && (
            <p>Background Image: <a href={videoResult.backgroundImage} target="_blank" rel="noopener noreferrer">View Image</a></p>
          )}
          <p>Use the "Check Video Status" section above to monitor progress and get the download link.</p>
        </div>
      )}
    </div>
  );
}
