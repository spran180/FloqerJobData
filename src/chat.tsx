import React, { useState } from 'react';
import axios from 'axios';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/chat', { message });
      setResponse(res.data.reply);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while processing your request.');
    }
  };

  return (
    <div>
      <h2>Chat with our service</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit">Send</button>
      </form>
      <div>
        <h3>Response:</h3>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default Chat;
