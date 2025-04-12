import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DocumentParserComponent } from '../components/DocumentParser/DocumentParserComponent';

export default function DocumentChatPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    
    // Add user message to chat
    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      
      // Add assistant message to chat
      const assistantMessage = { role: 'assistant', content: data.answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const handleClearVectors = async () => {
    try {
      const response = await fetch('/api/delete-vectors', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear vectors');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'All vectors have been cleared. Please re-upload your documents.'
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to clear vectors. Please try again.'
      }]);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Document Chat</title>
        <meta name="description" content="Chat with your documents using AI" />
      </Head>

      <main className="main-content">
        <div className="header">
          <button
            onClick={handleClearVectors}
            className="header-button clear-button"
          >
            Clear All Vectors
          </button>
          <Link href="/">
            <button className="header-button home-button">
              Home
            </button>
          </Link>
        </div>

        <div className="document-parser-section">
          <DocumentParserComponent />
        </div>
        
        <div className="chatbot-section">
          <h2>Chat with your Documents</h2>
          
          <div className="chat-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                Ask a question about your documents
              </div>
            ) : (
              <div className="messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role}`}>
                    <div className="content">{message.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="query-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !query.trim()}>
              {loading ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          width: 100%;
          background-color: #121212;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .main-content {
          flex: 1;
          width: 100%;
          max-width: 900px;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-bottom: 20px;
          width: 100%;
        }

        .header-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: white;
        }

        .clear-button {
          background: #dc2626;
        }

        .home-button {
          background: #0070f3;
        }

        .document-parser-section {
          margin-bottom: 40px;
          padding: 20px;
          background-color: #1e1e1e;
          border-radius: 8px;
          width: 100%;
          height: fit-content;
          min-height: auto;
        }

        .document-parser-section > div {
          height: fit-content;
          min-height: auto;
        }
        
        .chatbot-section {
          padding: 20px;
          background-color: #1e1e1e;
          border-radius: 8px;
          height: fit-content;
        }

        h2 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        
        .chat-container {
          background-color: #2a2a2a;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          min-height: 300px;
          max-height: 500px;
          overflow-y: auto;
        }
        
        .empty-state {
          color: #888;
          text-align: center;
          padding: 40px 0;
        }
        
        .messages {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .message {
          padding: 12px;
          border-radius: 8px;
          max-width: 80%;
        }
        
        .message.user {
          align-self: flex-end;
          background-color: #0070f3;
        }
        
        .message.assistant {
          align-self: flex-start;
          background-color: #333;
        }
        
        .query-form {
          display: flex;
          gap: 8px;
        }
        
        input {
          flex: 1;
          padding: 12px;
          border: 1px solid #333;
          border-radius: 4px;
          background-color: #2a2a2a;
          color: #fff;
          font-size: 16px;
        }

        input::placeholder {
          color: #888;
        }
        
        button {
          padding: 0 24px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          height: 44px;
        }
        
        button:disabled {
          background-color: #555;
          cursor: not-allowed;
        }
      `}</style>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #121212;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
} 