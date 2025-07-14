import { useState } from 'react';

export default function HomePage() {
  const [topic, setTopic] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h1>WealthyMogul.com - Test</h1>
      <p>AI-Powered Wealth Building Platform</p>
      
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
        style={{ padding: '10px', marginRight: '10px' }}
      />
      
      <button onClick={() => alert('Working!')}>
        Test Button
      </button>
      
      {topic && <p>Topic: {topic}</p>}
    </div>
  );
}
