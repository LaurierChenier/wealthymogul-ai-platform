import { useState } from 'react';

export default function YouTubeTest() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testYouTubeAPI = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/youtube-test?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'API test failed');
      }
    } catch (err) {
      setError('Failed to test YouTube API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: '#fff', 
          fontSize: '2.5rem', 
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          YouTube API Test - WealthyMogul.com
        </h1>
        <p style={{ 
          color: '#f0f0f0', 
          fontSize: '1.1rem',
          margin: '0'
        }}>
          Test YouTube integration for market research
        </p>
      </header>

      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '10px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>YouTube Channel Search Test</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for channels (e.g., 'real estate investing', 'wealth building')"
            style={{
              flex: '1',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            disabled={loading}
          />
          <button
            onClick={testYouTubeAPI}
            disabled={loading || !searchQuery.trim()}
            style={{
              padding: '12px 24px',
              background: loading ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Searching...' : 'Test YouTube API'}
          </button>
        </div>

        {error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {results && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <strong>✅ YouTube API Test Successful!</strong>
            <br />
            <strong>Search:</strong> "{results.searchQuery}"
            <br />
            <strong>Channels Found:</strong> {results.channelCount}
            <br />
            <strong>API Key Status:</strong> {results.apiTest.hasApiKey ? '✅ Connected' : '❌ Missing'}
          </div>
        )}

        {results && results.channels && results.channels.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Found Channels:</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {results.channels.map((channel, index) => (
                <div key={index} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  background: '#fff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    {channel.thumbnail && (
                      <img 
                        src={channel.thumbnail} 
                        alt={channel.title}
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                      />
                    )}
                    <div>
                      <h4 style={{ margin: '0', color: '#333' }}>{channel.title}</h4>
                      <small style={{ color: '#666' }}>ID: {channel.channelId}</small>
                    </div>
                  </div>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '14px', 
                    margin: '0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {channel.description || 'No description available'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ color: '#333', margin: '0 0 10px 0' }}>💡 Market Research Ideas:</h3>
        <ul style={{ color: '#666', margin: '0', paddingLeft: '20px' }}>
          <li>Search "real estate investing" to find your competitors</li>
          <li>Search "wealth building" to discover content opportunities</li>
          <li>Search "passive income" to research trending topics</li>
          <li>Search "financial freedom" to analyze successful channels</li>
        </ul>
      </div>
    </div>
  );
}
