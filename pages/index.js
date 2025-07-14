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
    if (!videoGeneration?.publicId) return;
    
    setIsRetrieving(true);
    try {
      // Check if this is a Runway ML video (use different endpoint)
      const isRunway = videoGeneration.provider === 'runway-ml';
      const endpoint = isRunway 
        ? `/api/runway-status?taskId=${videoGeneration.taskId || videoGeneration.publicId}`
        : `/api/retrieve-video?publicId=${videoGeneration.publicId}`;
      
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.success) {
        setVideoGeneration(prev => ({
          ...prev,
          ...result,
          lastChecked: new Date().toLocaleTimeString()
        }));
      } else {
        console.error('Video retrieval failed:', result.error || result.message);
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
            
            {/* Video Generation Options */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f4f8', borderRadius: '5px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>Choose Video Type:</h4>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleGenerateVideo}
                  disabled={isRetrieving}
                  style={{
                    padding: '12px 20px',
                    background: isRetrieving ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isRetrieving ? 'not-allowed' : 'pointer',
                    flex: '1',
                    minWidth: '200px'
                  }}>
                  {isRetrieving ? 'Processing...' : '🔵 Quick Video (6 sec)'}
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Eden AI • $0.50 • 2 mins
                  </div>
                </button>
                
                <button 
                  onClick={handleGenerateRunwayVideo}
                  disabled={isRetrieving}
                  style={{
                    padding: '12px 20px',
                    background: isRetrieving ? '#ccc' : '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isRetrieving ? 'not-allowed' : 'pointer',
                    flex: '1',
                    minWidth: '200px'
                  }}>
                  {isRetrieving ? 'Processing...' : '🟢 Professional Video (30 sec)'}
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Runway ML • $7-15 • 3-5 mins
                  </div>
                </button>
              </div>
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
            <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>AI Video Generation Status:</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> 
              <span style={{ 
                color: videoGeneration.status === 'completed' ? '#28a745' : 
                      videoGeneration.status === 'processing' ? '#ffc107' : '#dc3545',
                marginLeft: '8px',
                fontWeight: 'bold'
              }}>
                {videoGeneration.status?.toUpperCase() || 'SUBMITTED'}
              </span>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Public ID:</strong> {videoGeneration.publicId || videoGeneration.taskId}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Provider:</strong> {videoGeneration.provider || 'eden-ai'}
            </div>
            
            {videoGeneration.lastChecked && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Last Checked:</strong> {videoGeneration.lastChecked}
              </div>
            )}
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Message:</strong> {videoGeneration.message}
            </div>

            {(videoGeneration.status === 'processing' || videoGeneration.status === 'finished' || videoGeneration.status === 'submitted') && (
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
