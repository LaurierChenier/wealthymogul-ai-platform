import { useState } from 'react';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoGeneration, setVideoGeneration] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: generatedVideo.title,
          script: generatedVideo.scriptPreview 
        }),
      });
      const result = await response.json();
      if (result.success) {
        setVideoGeneration(result);
      }
    } catch (error) {
      console.error('Video generation failed:', error);
    }
  };

  const handleGenerateRunwayVideo = async () => {
    if (!generatedVideo) return;
    try {
      const response = await fetch('/api/generate-video-runway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: generatedVideo.title,
          script: generatedVideo.scriptPreview 
        }),
      });
      const result = await response.json();
      if (result.success) {
        setVideoGeneration(result);
      }
    } catch (error) {
      console.error('Runway video generation failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>WealthyMogul.com</h1>
      
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter wealth building topic"
        style={{ width: '300px', padding: '10px', marginRight: '10px' }}
      />
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Content'}
      </button>
      
      {generatedVideo && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
          <h3>Generated: {generatedVideo.title}</h3>
          <p>{generatedVideo.description}</p>
          
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={handleGenerateVideo}
              style={{ marginRight: '10px', padding: '10px', background: '#28a745', color: 'white', border: 'none' }}
            >
              🟢 Quick Video (6 sec)
            </button>
            <button 
              onClick={handleGenerateRunwayVideo}
              style={{ padding: '10px', background: '#8a2be2', color: 'white', border: 'none' }}
            >
              🟣 Professional Video (10 sec)
            </button>
          </div>
        </div>
      )}

      {videoGeneration && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#f0f8ff' }}>
          <h4>Video Status: {videoGeneration.status}</h4>
          <p>Provider: {videoGeneration.provider || 'eden'}</p>
          <p>ID: {videoGeneration.publicId || videoGeneration.taskId}</p>
        </div>
      )}
    </div>
  );
}
