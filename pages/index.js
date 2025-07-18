import { useState } from 'react';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoGeneration, setVideoGeneration] = useState(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [editedScript, setEditedScript] = useState('');
  const [useOwnScript, setUseOwnScript] = useState(false);
  const [youtubeLength, setYoutubeLength] = useState(120);
  const [instagramLength, setInstagramLength] = useState(30);
  const [selectedAvatar, setSelectedAvatar] = useState('daisy_wealth_mogul');

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

  const handleGenerateYouTubeVideo = async () => {
    if (!generatedVideo || !editedScript.trim()) return;
    
    setIsRetrieving(true);
    try {
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
          avatar: selectedAvatar
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
    if (!generatedVideo || !editedScript.trim()) return;
    
    setIsRetrieving(true);
    try {
      const response = await fetch('/api/generate-video-heygen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: generatedVideo.title,
          script: editedScript,
          duration: instagramLength,
          platform: 'instagram',
          avatar: selectedAvatar
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
    if (!videoGeneration?.videoId) return;
    
    setIsRetrieving(true);
    try {
      const response = await fetch(`/api/heygen-status?videoId=${videoGeneration.videoId}`);
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

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
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

      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        borderRadius: '10px', 
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>AI Video Generator</h2>
        
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
            placeholder={useOwnScript ? "Enter video title" : "Enter wealth building topic"}
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
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Choose Your AI Avatar:
                </label>
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
                  <option value="daisy_wealth_mogul">Daisy from Wealth Mogul</option>
                  <option value="laurier_wealth_mogul">Laurier from Wealth Mogul</option>
                  <option value="mason_wealth_mogul">Mason from Wealth Mogul</option>
                </select>
              </div>

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
              </div>

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
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button 
                  onClick={handleGenerateYouTubeVideo}
                  disabled={isRetrieving || !editedScript.trim()}
                  style={{
                    padding: '12px 20px',
                    background: (isRetrieving || !editedScript.trim()) ? '#ccc' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (isRetrieving || !editedScript.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                  🎬 YouTube Video ({youtubeLength/60}min)
                </button>
                <button 
                  onClick={handleGenerateInstagramVideo}
                  disabled={isRetrieving || !editedScript.trim()}
                  style={{
                    padding: '12px 20px',
                    background: (isRetrieving || !editedScript.trim()) ? '#ccc' : '#e1306c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (isRetrieving || !editedScript.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                  📱 Instagram Video ({instagramLength}sec)
                </button>
              </div>
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
            <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>HeyGen Video Status:</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> 
              <span style={{ 
                color: videoGeneration.status === 'completed' ? '#28a745' : '#ffc107',
                marginLeft: '8px',
                fontWeight: 'bold'
              }}>
                {videoGeneration.status?.toUpperCase() || 'PROCESSING'}
              </span>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Video ID:</strong> {videoGeneration.videoId}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Message:</strong> {videoGeneration.message}
            </div>

            {videoGeneration.status === 'processing' && (
              <button 
                onClick={handleRetrieveVideo}
                disabled={isRetrieving}
                style={{
                  padding: '8px 16px',
                  background: isRetrieving ? '#ccc' : '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isRetrieving ? 'not-allowed' : 'pointer'
                }}>
                {isRetrieving ? 'Checking...' : 'Check Video Status'}
              </button>
            )}

            {videoGeneration.videoUrl && (
              <div style={{ marginTop: '15px' }}>
                <strong style={{ color: '#28a745' }}>✅ Video Ready!</strong>
                <br />
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
                    borderRadius: '3px',
                    marginTop: '10px'
                  }}>
                  Download Video
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
