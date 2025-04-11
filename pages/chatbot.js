import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Chatbot() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      setAnswer(data.answer);
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
    setShowConfirmModal(false); // Close modal after confirmation
    try {
      const response = await fetch('/api/delete-vectors', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear vectors');
      }

      const data = await response.json();
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
        <title>RAG Chatbot</title>
        <meta name="description" content="RAG Chatbot using Pinecone and Upstage" />
      </Head>

      <div style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
        <Link href="/document-parser">
          <button
            style={{
              padding: '8px 16px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Go to Parser
          </button>
        </Link>
      </div>

      <main>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>RAG Chatbot</h1>
          <button
            onClick={handleClearVectors}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear All Vectors
          </button>
        </div>

        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Confirm Clear Vectors</h2>
              <p>Are you sure you want to clear all vectors? This action cannot be undone.</p>
              <div className="modal-buttons">
                <button onClick={handleClearVectors} className="confirm-button">
                  Yes, Clear All
                </button>
                <button onClick={() => setShowConfirmModal(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              Ask a question to start chatting
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
            placeholder="Ask a question..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !query.trim()}>
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        main {
          padding: 2rem 0;
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        
        .header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 0 0.5rem;
        }

        h1 {
          margin: 0;
          font-size: 2rem;
        }

        .clear-button {
          padding: 8px 16px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .clear-button:hover {
          background: #b91c1c;
        }
        
        .chat-container {
          width: 100%;
          height: 500px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 1rem;
          overflow-y: auto;
          margin-bottom: 1rem;
          background: #f9f9f9;
        }
        
        .empty-state {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
        }
        
        .messages {
          display: flex;
          flex-direction: column;
        }
        
        .message {
          margin-bottom: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          max-width: 80%;
        }
        
        .user {
          align-self: flex-end;
          background-color: #0070f3;
          color: white;
        }
        
        .assistant {
          align-self: flex-start;
          background-color: #e5e5e5;
          color: #333;
        }
        
        .content {
          word-break: break-word;
        }
        
        .query-form {
          display: flex;
          width: 100%;
        }
        
        input {
          flex-grow: 1;
          padding: 0.75rem;
          border: 1px solid #e5e5e5;
          border-radius: 4px 0 0 4px;
          font-size: 1rem;
        }
        
        button {
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          font-size: 1rem;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
          text-align: center;
        }

        .modal h2 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .modal p {
          margin-bottom: 1.5rem;
          color: #666;
        }

        .modal-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .confirm-button {
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .confirm-button:hover {
          background: #b91c1c;
        }

        .cancel-button {
          background: #e5e5e5;
          color: #333;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .cancel-button:hover {
          background: #d1d1d1;
        }
      `}</style>
    </div>
  );
} 