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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        {/* Header */}
        <header className="text-center py-8 border-b border-white/10">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            WealthyMogul.com
          </h1>
          <p className="text-xl opacity-80">AI-Powered Real Estate Empire Builder</p>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-12">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-emerald-500/20 p-6 rounded-2xl border border-emerald-500/30">
              <div className="text-2xl font-bold mb-2">🤖 AI Generator</div>
              <div className="opacity-90">Create professional real estate content with OpenAI</div>
            </div>
            
            <div className="bg-red-500/20 p-6 rounded-2xl border border-red-500/30">
              <div className="text-2xl font-bold mb-2">📺 YouTube</div>
              <div className="opacity-90">Auto-upload to YouTube for maximum reach</div>
            </div>
            
            <div className="bg-purple-500/20 p-6 rounded-2xl border border-purple-500/30">
              <div className="text-2xl font-bold mb-2">📱 Instagram</div>
              <div className="opacity-90">Cross-post as Reels for viral growth</div>
            </div>
            
            <div className="bg-green-500/20 p-6 rounded-2xl border border-green-500/30">
              <div className="text-2xl font-bold mb-2">💰 Revenue</div>
              <div className="opacity-90">Triple platform monetization strategy</div>
            </div>
          </div>

          {/* AI Video Generator */}
          <div className="bg-white/10 p-8 rounded-2xl border border-white/20 text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🚀 AI Video Generator</h2>
            <p className="text-lg opacity-90 mb-8">Generate professional real estate videos with AI</p>
            
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Enter video topic (e.g., 'How to Buy Your First Rental Property')"
                value={videoTopic}
                onChange={(e) => setVideoTopic(e.target.value)}
                className="w-full p-4 text-lg rounded-xl border border-white/30 bg-white/10 text-white placeholder-gray-400 mb-6"
              />
              
              <button
                onClick={generateVideo}
                disabled={generating || !videoTopic.trim()}
                className={`px-8 py-4 text-lg font-bold rounded-xl transition-all ${
                  generating || !videoTopic.trim()
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:scale-105'
                }`}
              >
                {generating ? '🤖 Generating AI Video...' : '⚡ Generate AI Video'}
              </button>
            </div>

            {/* Generated Video Display */}
            {generatedVideo && (
              <div className="mt-8 p-6 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                <h3 className="text-xl font-bold mb-4">✅ Video Generated Successfully!</h3>
                <div className="text-left max-w-3xl mx-auto space-y-2">
                  <p><strong>Title:</strong> {generatedVideo.video?.title}</p>
                  <p><strong>Description:</strong> {generatedVideo.video?.description}</p>
                  <p><strong>Category:</strong> {generatedVideo.video?.category}</p>
                  <div className="flex gap-4 mt-6 justify-center">
                    <button className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold">
                      📺 Upload to YouTube
                    </button>
                    <button className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold">
                      📱 Post to Instagram
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Revenue Dashboard */}
          <div className="bg-white/10 p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold mb-8 text-center">💰 Revenue Dashboard</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">$0.00</div>
                <div className="opacity-80">Platform Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">$0.00</div>
                <div className="opacity-80">YouTube Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">$0.00</div>
                <div className="opacity-80">Instagram Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">$0.00</div>
                <div className="opacity-80">Total Revenue</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/10 mt-12">
          <p className="opacity-80">© 2025 WealthyMogul.com - AI-Powered Wealth Building Empire</p>
        </footer>
      </div>
    </>
  );
}
