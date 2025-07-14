import { useState } from 'react';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoGeneration, setVideoGeneration] = useState(null);
  const [isRetrieving, setIsRetrieving] = useState(false);

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
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedVideo) return;
    
    setIsRetrieving(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: generatedVideo.title,
          script: generatedVideo.scriptPreview 
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

  const handleGenerateRunwayVideo = async () => {
    if (!generatedVideo) return;
    
    setIsRetrieving(true);
    try {
      const response = await fetch('/api/generate-video-runway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: generatedVideo.title,
          script: generatedVideo.scriptPreview 
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setVideoGeneration(result);
      } else {
        console.error('Runway video generation failed:', result.error);
      }
    } catch (error) {
      console.error('Runway video generation failed:', error);
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleRetrieveVideo = async () => {
    if (!videoGeneration?.publicId && !videoGeneration?.taskId) return;
    
    setIsRetrieving(true);
    try {
      let response;
      
      if (videoGeneration.provider === 'runway') {
        response = await fetch(`/api/runway-status?taskId=${videoGeneration.taskId}`);
      } else {
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
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter wealth building topic (e.g., 'Real Estate Investment Strategies')"
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
            onClick={handleGenerate}
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
            {isGenerating ? 'Generating...' : 'Generate Video'}
          </button>
        </div>

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
              <h4 style={{ color: '#0066cc', marginBottom: '10px' }}>Choose Video Type:</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button 
                  onClick={handleGenerateVideo}
                  disabled={isRetrieving}
                  style={{
                    padding: '12px 20px',
                    background: isRetrieving ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isRetrieving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '160px'
                  }}>
                  🟢 Quick Video (6 sec)
                  <br />
                  <small style={{ fontSize: '11px', opacity: 0.9 }}>Eden AI • $0.50 • 2 mins</small>
                </button>
                <button 
                  onClick={handleGenerateRunwayVideo}
                  disabled={isRetrieving}
                  style={{
                    padding: '12px 20px',
                    background: isRetrieving ? '#ccc' : '#8a2be2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isRetrieving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '160px'
                  }}>
                  🟣 Professional Video (10 sec)
                  <br />
                  <small style={{ fontSize: '11px', opacity: 0.9 }}>Runway ML • $7-15 • 3-5 mins</small>
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
            <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>
              {videoGeneration.provider === 'runway' ? 'Professional Video Generation Status:' : 'AI Video Generation Status:'}
            </h3>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Provider:</strong> 
              <span style={{ marginLeft: '8px' }}>
                {videoGeneration.provider === 'runway' ? 'Runway ML (Professional)' : 'Eden AI (Quick)'}
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
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>ID:</strong> {videoGeneration.publicId || videoGeneration.taskId}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Message:</strong> {videoGeneration.message}
            </div>

            {(videoGeneration.status === 'processing' || 
              videoGeneration.status === 'pending' || 
              videoGeneration.status === 'running' ||
              videoGeneration.status === 'PENDING' ||
              videoGeneration.status === 'RUNNING') && (
              <button 
                onClick={handleRetrieveVideo}
                disabled={isRetrieving}
                style={{
                  padding: '10px 20px',
                  background: isRetrieving ? '#ccc' : '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isRetrieving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  marginRight: '10px'
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
                    padding: '12px 24px',
                    background: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    marginTop: '10px',
                    fontWeight: 'bold'
                  }}>
                  📥 Download Video
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
