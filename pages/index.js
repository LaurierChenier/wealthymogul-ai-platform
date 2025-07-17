import { useState, useEffect } from 'react';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoGeneration, setVideoGeneration] = useState(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [editedScript, setEditedScript] = useState('');
  const [useOwnScript, setUseOwnScript] = useState(false);
  const [youtubeLength, setYoutubeLength] = useState(120); // Default 2 minutes
  const [instagramLength, setInstagramLength] = useState(30); // Default 30 seconds
  const [selectedAvatar, setSelectedAvatar] = useState(''); // Will be set after loading
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);

  // 🆕 AUTOMATIC AVATAR LOADING
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        console.log('🔄 Loading avatars automatically...');
        const response = await fetch('/api/load-avatars');
        const result = await response.json();
        
        if (result.success && result.avatars.length > 0) {
          setAvailableAvatars(result.avatars);
          // Set default avatar to first available one
          setSelectedAvatar(result.avatars[0].value);
          console.log(`✅ Loaded ${result.avatars.length} avatars automatically`);
        } else {
          console.error('❌ Failed to load avatars:', result.error);
          // Fallback to hardcoded avatars if API fails
          const fallbackAvatars = [
            { id: 'ae573c3333854730a9077d80b53d97e5', name: 'Daisy', display_name: 'Daisy from Wealth Mogul', value: 'daisy_wealth_mogul', type: 'talking_photo' },
            { id: '7f7b982477074c11b8593d0c60690f0a', name: 'Laurier', display_name: 'Laurier from Wealth Mogul', value: 'laurier_wealth_mogul', type: 'talking_photo' },
            { id: 'f379aa769b474121a59c128ebdcee2ad', name: 'Mason', display_name: 'Mason from Wealth Mogul', value: 'mason_wealth_mogul', type: 'talking_photo' }
          ];
          setAvailableAvatars(fallbackAvatars);
          setSelectedAvatar('daisy_wealth_mogul');
        }
      } catch (error) {
        console.error('💥 Avatar loading failed:', error);
        // Use fallback avatars
        const fallbackAvatars = [
          { id: 'ae573c3333854730a9077d80b53d97e5', name: 'Daisy', display_name: 'Daisy from Wealth Mogul', value: 'daisy_wealth_mogul', type: 'talking_photo' },
          { id: '7f7b982477074c11b8593d0c60690f0a', name: 'Laurier', display_name: 'Laurier from Wealth Mogul', value: 'laurier_wealth_mogul', type: 'talking_photo' },
          { id: 'f379aa769b474121a59c128ebdcee2ad', name: 'Mason', display_name: 'Mason from Wealth Mogul', value: 'mason_wealth_mogul', type: 'talking_photo' }
        ];
        setAvailableAvatars(fallbackAvatars);
        setSelectedAvatar('daisy_wealth_mogul');
      } finally {
        setIsLoadingAvatars(false);
      }
    };

    loadAvatars();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setVideoGeneration(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      const result = await response.json();
      setGeneratedVideo(result);
      setEditedScript(result.scriptPreview || '');
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateVideoSetup = () => {
    if (!topic.trim()) return;
    
    // For "My Own Script" mode, create a minimal video object
    const videoSetup = {
      title: topic,
      description: 'Custom video with user-provided script',
      category: 'Wealth Building',
      tags: ['wealth', 'finance', 'custom'],
      scriptPreview: editedScript
    };
    
    setGeneratedVideo(videoSetup);
  };

  const handleUpdateScript = () => {
    if (generatedVideo && editedScript.trim()) {
      setGeneratedVideo(prev => ({
        ...prev,
        scriptPreview: editedScript
      }));
    }
  };

  const handleClearScript = () => {
    setEditedScript('');
    if (generatedVideo) {
      setGeneratedVideo(prev => ({
        ...prev,
        scriptPreview: ''
      }));
    }
  };

  const handleUseAIScript = () => {
    if (generatedVideo) {
      setEditedScript(generatedVideo.scriptPreview || '');
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedVideo || !editedScript.trim()) return;
    
    setIsRetrieving(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: generatedVideo.title,
          script: editedScript 
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setVideoGeneration(result);
      } else {
        console.error('Video generation failed:', result.error);
      }
    } catch (error) {
      console.error('Video generation failed:', error);
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleGenerateYouTubeVideo = async () => {
    if (!generatedVideo || !editedScript.trim() || !selectedAvatar) return;
    
    setIsRetrieving(true);
    try {
      // Find the selected avatar details
      const selectedAvatarData = availableAvatars.find(av => av.value === selectedAvatar);
      
      const response = await fetch('/api/generate-video-heygen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: generatedVideo.title,
          script: editedScript,
          duration: youtubeLength,
          platform: 'youtube',
          avatar: selectedAvatar,
          avatarId: selectedAvatarData?.id // 🆕 DYNAMIC AVATAR ID
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setVideoGeneration(result);
      } else {
        console.error('YouTube video generation failed:', result.error);
      }
    } catch (error) {
      console.error('YouTube video generation failed:', error);
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleGenerateInstagramVideo = async () => {
    if (!generatedVideo || !editedScript.trim() || !selectedAvatar) return;
    
    setIsRetrieving(true);
    try {
      // Find the selected avatar details
      const selectedAvatarData = availableAvatars.find(av => av.value === selectedAvatar);
      
      const response = await fetch('/api/generate-video-heygen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: generatedVideo.title,
          script: editedScript.substring(0, instagramLength === 30 ? 200 : 400),
          duration: instagramLength,
          platform: 'instagram',
          avatar: selectedAvatar,
          avatarId: selectedAvatarData?.id // 🆕 DYNAMIC AVATAR ID
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setVideoGeneration(result);
      } else {
        console.error('Instagram video generation failed:', result.error);
      }
    } catch (error) {
      console.error('Instagram video generation failed:', error);
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleRetrieveVideo = async () => {
    if (!videoGeneration?.publicId && !videoGeneration?.videoId && !videoGeneration?.taskId) return;
    
    setIsRetrieving(true);
    try {
      let response;
      
      if (videoGeneration.provider === 'heygen') {
        // Use HeyGen status endpoint
        response = await fetch(`/api/heygen-status?videoId=${videoGeneration.videoId}`);
      } else if (videoGeneration.provider === 'synthesia') {
        // Use Synthesia status endpoint
        response = await fetch(`/api/synthesia-status?videoId=${videoGeneration.videoId}`);
      } else if (videoGeneration.provider === 'runway') {
        // Use Runway status endpoint
        response = await fetch(`/api/runway-status?taskId=${videoGeneration.taskId}`);
      } else {
        // Use Eden AI status endpoint
        response = await fetch(`/api/retrieve-video?publicId=${videoGeneration.publicId}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setVideoGeneration(prev => ({
          ...prev,
          ...result,
          lastChecked: new Date().toLocaleTimeString()
        }));
      }
    } catch (error) {
      console.error('Video retrieval failed:', error);
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleExtendVideo = async () => {
    if (!videoGeneration?.taskId) return;
    
    setIsRetrieving(true);
    try {
      console.log('Starting video extension process...');
      
      // Stage 2 Extension
      const stage2Response = await fetch('/api/runway-extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: videoGeneration.taskId,
          stage: 2,
          originalPrompt: `${generatedVideo.title}: ${generatedVideo.scriptPreview}`,
          previousVideoUrl: videoGeneration.videoUrl
        })
      });
      
      if (stage2Response.ok) {
        const stage2Result = await stage2Response.json();
        console.log('Stage 2 extension started:', stage2Result);
        
        // Update UI to show extension in progress
        setVideoGeneration(prev => ({
          ...prev,
          status: 'processing',
          message: 'Extending video to 18 seconds (Stage 2/4)...',
          progress: 50,
          currentStage: 2,
          extendingTaskId: stage2Result.taskId
        }));
        
        // Poll for Stage 2 completion
        const pollStage2 = async () => {
          const statusResponse = await fetch(`/api/runway-status?taskId=${stage2Result.taskId}`);
          const statusResult = await statusResponse.json();
          
          if (statusResult.status === 'succeeded') {
            console.log('Stage 2 completed, starting Stage 3...');
            
            // Stage 3 Extension
            const stage3Response = await fetch('/api/runway-extend', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                assetId: stage2Result.taskId,
                stage: 3,
                originalPrompt: `${generatedVideo.title}: ${generatedVideo.scriptPreview}`,
                previousVideoUrl: statusResult.videoUrl
              })
            });
            
            if (stage3Response.ok) {
              const stage3Result = await stage3Response.json();
              
              setVideoGeneration(prev => ({
                ...prev,
                message: 'Extending video to 26 seconds (Stage 3/4)...',
                progress: 75,
                currentStage: 3,
                extendingTaskId: stage3Result.taskId
              }));
              
              // Poll for Stage 3 completion
              const pollStage3 = async () => {
                const status3Response = await fetch(`/api/runway-status?taskId=${stage3Result.taskId}`);
                const status3Result = await status3Response.json();
                
                if (status3Result.status === 'succeeded') {
                  console.log('Stage 3 completed, starting Stage 4...');
                  
                  // Stage 4 Extension (Final)
                  const stage4Response = await fetch('/api/runway-extend', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      assetId: stage3Result.taskId,
                      stage: 4,
                      originalPrompt: `${generatedVideo.title}: ${generatedVideo.scriptPreview}`,
                      previousVideoUrl: status3Result.videoUrl
                    })
                  });
                  
                  if (stage4Response.ok) {
                    const stage4Result = await stage4Response.json();
                    
                    setVideoGeneration(prev => ({
                      ...prev,
                      message: 'Final extension to 34 seconds (Stage 4/4)...',
                      progress: 90,
                      currentStage: 4,
                      extendingTaskId: stage4Result.taskId
                    }));
                    
                    // Poll for final completion
                    const pollFinal = async () => {
                      const finalResponse = await fetch(`/api/runway-status?taskId=${stage4Result.taskId}`);
                      const finalResult = await finalResponse.json();
                      
                      if (finalResult.status === 'succeeded') {
                        setVideoGeneration(prev => ({
                          ...prev,
                          status: 'succeeded',
                          message: '34-second professional video completed!',
                          progress: 100,
                          currentStage: 4,
                          videoUrl: finalResult.videoUrl,
                          duration: '34 seconds'
                        }));
                      } else if (finalResult.status === 'failed') {
                        setVideoGeneration(prev => ({
                          ...prev,
                          status: 'failed',
                          message: 'Final extension failed'
                        }));
                      } else {
                        setTimeout(pollFinal, 5000);
                      }
                    };
                    
                    setTimeout(pollFinal, 5000);
                  }
                }
              };
              
              setTimeout(pollStage3, 5000);
            }
          }
        };
        
        setTimeout(pollStage2, 5000);
      }
    } catch (error) {
      console.error('Video extension failed:', error);
      setVideoGeneration(prev => ({
        ...prev,
        status: 'failed',
        message: 'Video extension failed'
      }));
    } finally {
      setIsRetrieving(false);
    }
  };

  // Get selected avatar details for display
  const selectedAvatarData = availableAvatars.find(av => av.value === selectedAvatar);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: '#fff', 
          fontSize: '3rem', 
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          WealthyMogul.com
        </h1>
        <p style={{ 
          color: '#f0f0f0', 
          fontSize: '1.2rem',
          margin: '0'
        }}>
          AI-Powered Wealth Building Content Platform
        </p>
      </header>

      {/* AI Generator Section */}
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        borderRadius: '10px', 
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>AI Video Generator</h2>
        
        {/* Script Mode Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#666', marginBottom: '10px', fontSize: '16px' }}>Choose Script Mode:</h3>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="scriptMode" 
                checked={!useOwnScript} 
                onChange={() => setUseOwnScript(false)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ color: '#333' }}>AI Generated Script</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="scriptMode" 
                checked={useOwnScript} 
                onChange={() => setUseOwnScript(true)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ color: '#333' }}>My Own Script</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={useOwnScript ? "Enter video title" : "Enter wealth building topic (e.g., 'Real Estate Investment Strategies')"}
            style={{
              flex: '1',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            disabled={isGenerating}
          />
          <button
            onClick={useOwnScript ? handleCreateVideoSetup : handleGenerate}
            disabled={isGenerating || !topic.trim()}
            style={{
              padding: '12px 24px',
              background: isGenerating ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? 'Generating...' : (useOwnScript ? 'Create Video Setup' : 'Generate Content')}
          </button>
        </div>

        {/* Script Editing Section */}
        {(generatedVideo || useOwnScript) && (
          <div style={{ 
            background: '#f0f8ff', 
            border: '1px solid #0066cc', 
            borderRadius: '5px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>Edit Script:</h3>
            <textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              placeholder={useOwnScript ? "Enter your script here..." : "AI-generated script will appear here..."}
              style={{
                width: '100%',
                height: '150px',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'Arial, sans-serif'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={handleUpdateScript}
                disabled={!editedScript.trim()}
                style={{
                  padding: '8px 16px',
                  background: editedScript.trim() ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: editedScript.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Update Script
              </button>
              <button
                onClick={handleClearScript}
                style={{
                  padding: '8px 16px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear Script
              </button>
              {!useOwnScript && (
                <button
                  onClick={handleUseAIScript}
                  disabled={!generatedVideo?.scriptPreview}
                  style={{
                    padding: '8px 16px',
                    background: generatedVideo?.scriptPreview ? '#6c757d' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: generatedVideo?.scriptPreview ? 'pointer' : 'not-allowed',
                    fontSize: '14px'
                  }}
                >
                  Use AI Script
                </button>
              )}
            </div>
          </div>
        )}

        {generatedVideo && (
          <div style={{ 
            background: '#f8f9fa', 
            border: '1px solid #e9ecef', 
            borderRadius: '5px', 
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Generated Content:</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Title:</strong> {generatedVideo.title}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Description:</strong> {generatedVideo.description}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Category:</strong> {generatedVideo.category}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Tags:</strong> {generatedVideo.tags ? generatedVideo.tags.join(', ') : 'N/A'}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#0066cc', marginBottom: '15px' }}>Choose Video Type & Duration:</h4>
              
              {/* 🆕 AUTOMATIC AVATAR SELECTION */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Choose Your AI Avatar:
                </label>
                {isLoadingAvatars ? (
                  <div style={{ padding: '8px 12px', color: '#666' }}>
                    🔄 Loading your avatars automatically...
                  </div>
                ) : (
                  <select 
                    value={selectedAvatar} 
                    onChange={(e) => setSelectedAvatar(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      marginRight: '10px',
                      background: '#fff',
                      minWidth: '250px'
                    }}
                  >
                    {availableAvatars.map(avatar => (
                      <option key={avatar.value} value={avatar.value}>
                        {avatar.display_name}
                      </option>
                    ))}
                  </select>
                )}
                
                {selectedAvatarData && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    💡 Preview: <strong>{selectedAvatarData.display_name}</strong> will be your video presenter
                    <br />
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      🤖 {selectedAvatarData.type === 'talking_photo' ? 'Custom Talking Photo Avatar' : 'Standard Avatar'} • Automatically loaded from your HeyGen account
                    </span>
                  </div>
                )}
              </div>

              {/* YouTube Duration Selection */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  YouTube Video Duration:
                </label>
                <select 
                  value={youtubeLength} 
                  onChange={(e) => setYoutubeLength(parseInt(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    marginRight: '10px',
                    background: '#fff'
                  }}
                >
                  <option value={120}>2 Minutes</option>
                  <option value={180}>3 Minutes</option>
                  <option value={300}>5 Minutes</option>
                </select>
                <span style={{ color: '#666', fontSize: '13px' }}>
                  {youtubeLength === 120 ? 'Perfect for quick tips' : 
                   youtubeLength === 180 ? 'Great for detailed explanations' : 
                   'Comprehensive deep-dive content'}
                </span>
              </div>

              {/* Instagram Duration Selection */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Instagram Video Duration:
                </label>
                <select 
                  value={instagramLength} 
                  onChange={(e) => setInstagramLength(parseInt(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    marginRight: '10px',
                    background: '#fff'
                  }}
                >
                  <option value={30}>30 Seconds</option>
                  <option value={60}>1 Minute</option>
                </select>
                <span style={{ color: '#666', fontSize: '13px' }}>
                  {instagramLength === 30 ? 'Quick engaging highlights' : 'Extended Instagram content'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button 
                  onClick={handleGenerateVideo}
                  disabled={isRetrieving || !editedScript.trim()}
                  style={{
                    padding: '12px 20px',
                    background: (isRetrieving || !editedScript.trim()) ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (isRetrieving || !editedScript.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '160px'
                  }}>
                  🟢 Quick Video (6 sec)
                  <br />
                  <small style={{ fontSize: '11px', opacity: 0.9 }}>Eden AI • $0.50 • 2 mins</small>
                </button>
                <button 
                  onClick={handleGenerateYouTubeVideo}
                  disabled={isRetrieving || !editedScript.trim() || isLoadingAvatars}
                  style={{
                    padding: '12px 20px',
                    background: (isRetrieving || !editedScript.trim() || isLoadingAvatars) ? '#ccc' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (isRetrieving || !editedScript.trim() || isLoadingAvatars) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '160px'
                  }}>
                  🎬 YouTube Video ({youtubeLength/60}min)
                  <br />
                  <small style={{ fontSize: '11px', opacity: 0.9 }}>HeyGen • Auto Avatars • 3-5 mins</small>
                </button>
                <button 
                  onClick={handleGenerateInstagramVideo}
                  disabled={isRetrieving || !editedScript.trim() || isLoadingAvatars}
                  style={{
                    padding: '12px 20px',
                    background: (isRetrieving || !editedScript.trim() || isLoadingAvatars) ? '#ccc' : '#e1306c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (isRetrieving || !editedScript.trim() || isLoadingAvatars) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '160px'
                  }}>
                  📱 Instagram Video ({instagramLength}sec)
                  <br />
                  <small style={{ fontSize: '11px', opacity: 0.9 }}>HeyGen • Auto Avatars • 3-5 mins</small>
                </button>
              </div>
              {!editedScript.trim() && (
                <p style={{ color: '#dc3545', fontSize: '14px', margin: '10px 0' }}>
                  ⚠️ Please enter a script to generate videos
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{
                padding: '8px 16px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}>
                Upload to YouTube
              </button>
              <button style={{
                padding: '8px 16px',
                background: '#e1306c',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}>
                Post to Instagram
              </button>
            </div>
          </div>
        )}

        {videoGeneration && (
          <div style={{ 
            background: '#f0f8ff', 
            border: '1px solid #0066cc', 
            borderRadius: '5px', 
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>
              {videoGeneration.provider === 'heygen' ? 'HeyGen AI Avatar Video Status:' :
               videoGeneration.provider === 'runway' ? 'Professional Video Generation Status:' : 
               'AI Video Generation Status:'}
            </h3>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Provider:</strong> 
              <span style={{ marginLeft: '8px' }}>
                {videoGeneration.provider === 'heygen' ? 'HeyGen (AI Avatar)' : 
                 videoGeneration.provider === 'runway' ? 'Runway ML (Professional)' : 
                 'Eden AI (Quick)'}
              </span>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> 
              <span style={{ 
                color: videoGeneration.status === 'completed' || videoGeneration.status === 'succeeded' ? '#28a745' : 
                      videoGeneration.status === 'processing' || videoGeneration.status === 'pending' || videoGeneration.status === 'running' ? '#ffc107' : '#dc3545',
                marginLeft: '8px',
                fontWeight: 'bold'
              }}>
                {videoGeneration.status?.toUpperCase() || 'SUBMITTED'}
              </span>
              {videoGeneration.progress && (
                <span style={{ marginLeft: '8px', color: '#666' }}>
                  ({videoGeneration.progress}%)
                </span>
              )}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Avatar:</strong> {selectedAvatarData?.display_name || videoGeneration.avatar || 'Default'}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>ID:</strong> {videoGeneration.publicId || videoGeneration.videoId || videoGeneration.taskId}
            </div>
            
            {videoGeneration.lastChecked && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Last Checked:</strong> {videoGeneration.lastChecked}
              </div>
            )}
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Message:</strong> {videoGeneration.message}
            </div>

            {(videoGeneration.status === 'processing' || videoGeneration.status === 'pending' || videoGeneration.status === 'running' || videoGeneration.status === 'PENDING' || videoGeneration.status === 'PROCESSING' || videoGeneration.status === 'RUNNING') && (
              <button 
                onClick={handleRetrieveVideo}
                disabled={isRetrieving}
                style={{
                  padding: '8px 16px',
                  background: isRetrieving ? '#ccc' : '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isRetrieving ? 'not-allowed' : 'pointer',
                  marginRight: '10px'
                }}>
                {isRetrieving ? 'Checking...' : 'Check Video Status'}
              </button>
            )}

            {videoGeneration.videoUrl && (
              <div style={{ marginTop: '15px' }}>
                <strong style={{ color: '#28a745' }}>✅ Video Ready!</strong>
                <br />
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <a 
                    href={videoGeneration.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      background: '#28a745',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '3px'
                    }}>
                    Download Video ({videoGeneration.duration || '10 seconds'})
                  </a>
                  
                  {videoGeneration.provider === 'runway' && videoGeneration.currentStage === 4 && !videoGeneration.duration?.includes('34') && (
                    <button 
                      onClick={handleExtendVideo}
                      disabled={isRetrieving}
                      style={{
                        padding: '8px 16px',
                        background: isRetrieving ? '#ccc' : '#8a2be2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: isRetrieving ? 'not-allowed' : 'pointer'
                      }}>
                      {isRetrieving ? 'Extending...' : 'Extend to 34 seconds'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revenue Dashboard */}
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        borderRadius: '10px', 
        padding: '30px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Triple Platform Revenue Dashboard</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '2px solid #667eea'
          }}>
            <h3 style={{ color: '#667eea', margin: '0 0 10px 0' }}>WealthyMogul.com</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>$0.00</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>AdSense Revenue</div>
          </div>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '2px solid #dc3545'
          }}>
            <h3 style={{ color: '#dc3545', margin: '0 0 10px 0' }}>YouTube</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>$0.00</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Ad Revenue + Sponsorships</div>
          </div>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '2px solid #e1306c'
          }}>
            <h3 style={{ color: '#e1306c', margin: '0 0 10px 0' }}>Instagram</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>$0.00</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Reels + Brand Partnerships</div>
          </div>
        </div>
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#e8f5e8', 
          borderRadius: '8px',
          border: '2px solid #28a745'
        }}>
          <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>Total Revenue</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>$0.00</div>
          <div style={{ color: '#666' }}>Combined earnings from all platforms</div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ 
        marginTop: '40px',
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333' }}>🤖 AI Content Generation</h3>
          <p style={{ color: '#666' }}>Generate wealth-building video scripts, titles, and descriptions instantly</p>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333' }}>📱 Multi-Platform Publishing</h3>
          <p style={{ color: '#666' }}>Automatically distribute content to YouTube and Instagram</p>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333' }}>💰 Revenue Optimization</h3>
          <p style={{ color: '#666' }}>Triple revenue streams with AdSense, YouTube, and Instagram monetization</p>
        </div>
      </div>
    </div>
  );
}
