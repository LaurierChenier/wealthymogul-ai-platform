import { useState } from 'react';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [actualVideo, setActualVideo] = useState(null);
  const [retrievedVideo, setRetrievedVideo] = useState(null);
  const [isRetrieving, setIsRetrieving] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
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

  const handleVideoGeneration = async () => {
    if (!generatedVideo) return;
    
    setIsGeneratingVideo(true);
    setActualVideo(null);
    setRetrievedVideo(null);
    
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          script: generatedVideo.scriptPreview,
          title: generatedVideo.title 
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setActualVideo(result);
      } else {
        alert('Video generation failed: ' + result.error);
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('Video generation failed: ' + error.message);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleVideoRetrieval = async () => {
    if (!actualVideo?.publicId) return;
    
    setIsRetrieving(true);
    setRetrievedVideo(null);
    
    try {
      const response = await fetch('/api/retrieve-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          publicId: actualVideo.publicId
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRetrievedVideo(result);
      } else {
        alert('Video retrieval failed: ' + result.error);
      }
    } catch (error) {
      console.error('Video retrieval failed:', error);
      alert('Video retrieval failed: ' + error.message);
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
            {isGenerating ? 'Generating...' : 'Generate Script'}
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
            
            {/* Real Video Generation Button */}
            <div style={{ marginBottom: '15px', padding: '15px', background: '#e8f5e8', borderRadius: '5px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>🎬 Create Actual Video</h4>
              <button
                onClick={handleVideoGeneration}
                disabled={isGeneratingVideo}
                style={{
                  padding: '12px 24px',
                  background: isGeneratingVideo ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: isGeneratingVideo ? 'not-allowed' : 'pointer',
                  marginRight: '10px'
                }}
              >
                {isGeneratingVideo ? 'Creating Video...' : '🎬 Generate Actual Video'}
              </button>
              <small style={{ color: '#666' }}>
                This will create a 30-second educational video using AI (Eden AI) - Perfect for real estate tutorials!
              </small>
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

        {/* Video Generation Results - WITH RETRIEVAL BUTTON */}
        {actualVideo && (
          <div style={{ 
            background: '#d4edda', 
            border: '2px solid #28a745', 
            borderRadius: '5px', 
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#28a745', marginBottom: '15px' }}>🎉 Video Generated Successfully!</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Video Title:</strong> {actualVideo.title}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Duration:</strong> {actualVideo.duration}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Resolution:</strong> {actualVideo.resolution}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Provider:</strong> {actualVideo.provider}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Public ID:</strong> {actualVideo.publicId || 'NOT_FOUND'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Estimated Cost:</strong> {actualVideo.estimatedCost || '$2.50'}
            </div>
            
            {/* Retrieve Video Button */}
            {actualVideo.publicId && (
              <div style={{ marginBottom: '15px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📥 Get Your 30-Second Video</h4>
                <button
                  onClick={handleVideoRetrieval}
                  disabled={isRetrieving}
                  style={{
                    padding: '12px 24px',
                    background: isRetrieving ? '#ccc' : '#ffc107',
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    cursor: isRetrieving ? 'not-allowed' : 'pointer',
                    marginRight: '10px'
                  }}
                >
                  {isRetrieving ? 'Retrieving Video...' : '📥 Retrieve Actual Video'}
                </button>
                <small style={{ color: '#666' }}>
                  Click to download your 30-second educational video (processing takes 5-10 minutes)
                </small>
              </div>
            )}
            
            {/* Show ALL response data for debugging */}
            <div style={{ 
              background: '#fff', 
              padding: '15px', 
              borderRadius: '5px',
              border: '1px solid #ddd',
              marginTop: '15px'
            }}>
              <h4>Complete Response Data:</h4>
              <pre style={{ 
                background: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '3px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(actualVideo, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Retrieved Video Section */}
        {retrievedVideo && (
          <div style={{ 
            background: '#d1ecf1', 
            border: '2px solid #0c5460', 
            borderRadius: '5px', 
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#0c5460', marginBottom: '15px' }}>🎬 30-Second Video Retrieved Successfully!</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> {retrievedVideo.status}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Video URL:</strong> {retrievedVideo.videoUrl ? 
                <a href={retrievedVideo.videoUrl} target="_blank" rel="noopener noreferrer" style={{color: '#007bff'}}>
                  Download 30-Second Video
                </a> : 'Processing... (this takes 5-10 minutes for 30-second videos)'}
            </div>
            
            {/* Show video player if URL is available */}
            {retrievedVideo.videoUrl && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#0c5460' }}>Your AI-Generated Real Estate Video:</h4>
                <video 
                  controls 
                  style={{ width: '100%', maxWidth: '600px', height: 'auto' }}
                  src={retrievedVideo.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                  Perfect for Instagram Reels, YouTube Shorts, and TikTok!
                </p>
              </div>
            )}
            
            {/* Show complete retrieval data */}
            <div style={{ 
              background: '#fff', 
              padding: '15px', 
              borderRadius: '5px',
              border: '1px solid #ddd',
              marginTop: '15px'
            }}>
              <h4>Complete Retrieval Data:</h4>
              <pre style={{ 
                background: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '3px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(retrievedVideo, null, 2)}
              </pre>
            </div>
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
          <p style={{ color: '#666' }}>Generate 30-second wealth-building video content perfect for social media</p>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333' }}>📱 Multi-Platform Publishing</h3>
          <p style={{ color: '#666' }}>Perfect for Instagram Reels, YouTube Shorts, and TikTok</p>
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
