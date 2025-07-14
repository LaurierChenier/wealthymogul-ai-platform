import { useState } from 'react';

export default function HomePage() {
  const [topic, setTopic] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h1>WealthyMogul.com</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
      />
      <p>Topic: {topic}</p>
    </div>
  );
}
