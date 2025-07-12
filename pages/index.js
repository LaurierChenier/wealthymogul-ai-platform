import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [videoTopic, setVideoTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);

  const generateVideo = async () => {
    if (!videoTopic.trim()) return;
    
    setGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: videoTopic })
      });
      
      const result = await response.json();
      setGeneratedVideo(result);
    } catch (error) {
      console.error('Generation failed:', error);
    }
    setGenerating(false);
  };

  return (
    <>
      <Head>
        <title>WealthyMogul.com - AI Real Estate Empire</title>
        <meta name="description" content="Generate AI-powered real estate videos and build wealth across multiple platforms" />
      </Head>
      
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1e293b 0%, #1e40af 50%, #1e293b 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        {/* Header */}
        <header style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WealthyMogul.com
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>AI-Powered Real Estate Empire Builder</p>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>🤖 AI Generator</div>
              <div style={{ opacity: 0.9 }}>Create professional real estate content with OpenAI</div>
            </div>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>📺 YouTube</div>
              <div style={{ opacity: 0.9 }}>Auto-upload to YouTube for maximum reach</div>
            </div>
            
            <div style={{ background: 'rgba(147, 51, 234, 0.2)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(147, 51, 234, 0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>📱 Instagram</div>
              <div style={{ opacity: 0.9 }}>Cross-post as Reels for viral growth</div>
            </div>
            
            <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>💰 Revenue</div>
              <div style={{ opacity: 0.9 }}>Triple platform monetization strategy</div>
            </div>
          </div>

          {/* AI Video Generator */}
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>🚀 AI Video Generator</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px' }}>Generate professional real estate videos with AI</p>
            
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="Enter video topic (e.g., 'How to Buy Your First Rental Property')"
                value={videoTopic}
                onChange={(e) => setVideoTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  fontSize: '1.1rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  marginBottom: '20px'
                }}
              />
              
              <button
                onClick={generateVideo}
                disabled={generating || !videoTopic.trim()}
                style={{
                  background: generating ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #10b981, #3b82f6)',
                  color: 'white',
                  padding: '15px 40px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '15px',
                  border: 'none',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {generating ? '🤖 Generating AI Video...' : '⚡ Generate AI Video'}
              </button>
            </div>

            {/* Generated Video Display */}
            {generatedVideo && (
              <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px' }}>✅ Video Generated Successfully!</h3>
                <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
                  <p><strong>Title:</strong> {generatedVideo.video?.title}</p>
                  <p><strong>Description:</strong> {generatedVideo.video?.description}</p>
                  <p><strong>Category:</strong> {generatedVideo.video?.category}</p>
                  <div style={{ marginTop: '20px' }}>
                    <button style={{ background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', marginRight: '10px', cursor: 'pointer' }}>
                      📺 Upload to YouTube
                    </button>
                    <button style={{ background: '#8b5cf6', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                      📱 Post to Instagram
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Revenue Dashboard */}
          <div style={{ marginTop: '40px', background: 'rgba(255, 255, 255, 0.1)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>💰 Revenue Dashboard</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>$0.00</div>
                <div style={{ opacity: 0.8 }}>Platform Revenue</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>$0.00</div>
                <div style={{ opacity: 0.8 }}>YouTube Revenue</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>$0.00</div>
                <div style={{ opacity: 0.8 }}>Instagram Revenue</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#eab308' }}>$0.00</div>
                <div style={{ opacity: 0.8 }}>Total Revenue</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ opacity: 0.8 }}>© 2025 WealthyMogul.com - AI-Powered Wealth Building Empire</p>
        </footer>
      </div>
    </>
  );
}
