import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DocumentParserComponent } from '../components/DocumentParser/DocumentParserComponent';

export default function DocumentChatPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    
    // Add user message to chat
    const userMessage = { role: 'user', content: query };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          messages: updatedMessages // Pass the entire conversation history
        }),
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

      const data = await response.json();

      // Show modal for "already cleared" message
      if (data.message === 'All vectors have already been cleared') {
        setModalMessage(data.message);
        setShowModal(true);
        return;
      }

      // For successful deletion, just succeed silently
      if (response.ok) {
        return;
      }

      // Only show error modal for unexpected errors
      setModalMessage("Unable to reset vectors. Please try again.");
      setShowModal(true);
    } catch (error) {
      console.error('Error:', error);
      // Show a generic error message in modal
      setModalMessage("Unable to reset vectors. Please try again.");
      setShowModal(true);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Therapeutic Conversation</title>
        <meta name="description" content="Have a supportive conversation with an AI psychologist" />
      </Head>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <p>{modalMessage}</p>
              <button onClick={() => setShowModal(false)} className="modal-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        <div className="header">
          <button
            onClick={handleClearVectors}
            className="header-button clear-button"
          >
            Reset Vectors
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
          <h2>Therapeutic Conversation Space</h2>
          
          <div className="chat-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                Share what's on your mind or what you'd like support with today
              </div>
            ) : (
              <div className="messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role}`}>
                    <div className="content">
                      {message.role === 'assistant' ? (
                        <div className="formatted-message">
                          {message.content.split('\n\n').map((paragraph, i) => {
                            // Handle section titles
                            if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                              return (
                                <h3 key={i} className="section-title">
                                  {paragraph.replace(/\*\*/g, '')}
                                </h3>
                              );
                            }
                            
                            // Handle bullet points with emphasis
                            if (paragraph.trim().startsWith('- **')) {
                              const [title, ...content] = paragraph.substring(2).split('**');
                              return (
                                <div key={i} className="bullet-point">
                                  <strong>{title.trim()}</strong>
                                  {content.join('').replace(/\*\*/g, '')}
                                </div>
                              );
                            }

                            // Handle regular bullet points
                            if (paragraph.trim().startsWith('- ')) {
                              return (
                                <div key={i} className="bullet-point">
                                  {paragraph.substring(2)}
                                </div>
                              );
                            }

                            // Handle numbered items
                            if (paragraph.match(/^\d+\.\s/)) {
                              return (
                                <div key={i} className="numbered-item">
                                  {paragraph}
                                </div>
                              );
                            }

                            // Handle regular paragraphs
                            return (
                              <p key={i} className="message-paragraph">
                                {paragraph}
                              </p>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="user-message">
                          {message.content}
                        </div>
                      )}
                    </div>
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
              placeholder="Express your thoughts or feelings here..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !query.trim()}>
              {loading ? 'Listening...' : 'Share'}
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
          background: #6d28d9;
        }

        .home-button {
          background: #4f46e5;
        }

        .document-parser-section {
          margin-bottom: 40px;
          padding: 20px;
          background-color: #1e293b;
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
          background-color: #1e293b;
          border-radius: 8px;
          height: fit-content;
        }

        h2 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #e2e8f0;
        }
        
        .chat-container {
          background-color: #0f172a;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          min-height: 300px;
          max-height: 600px;
          overflow-y: auto;
          scroll-behavior: smooth;
        }
        
        .empty-state {
          color: #94a3b8;
          text-align: center;
          padding: 40px 0;
          font-style: italic;
        }
        
        .messages {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .message {
          padding: 20px;
          border-radius: 12px;
          max-width: 85%;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          margin-bottom: 16px;
          line-height: 1.6;
        }
        
        .message.user {
          align-self: flex-end;
          background-color: #3b82f6;
          color: white;
          margin-left: 15%;
        }
        
        .message.assistant {
          align-self: flex-start;
          background-color: #4f46e5;
          color: white;
          border-radius: 12px 12px 12px 0;
          margin-right: 15%;
        }
        
        .formatted-message {
          line-height: 1.6;
          font-size: 15px;
        }
        
        .section-title {
          font-size: 17px;
          font-weight: 600;
          margin: 16px 0 12px 0;
          color: #f8fafc;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 8px;
        }
        
        .section-title:first-child {
          margin-top: 0;
        }
        
        .bullet-point {
          margin: 8px 0 8px 12px;
          position: relative;
          padding-left: 16px;
        }
        
        .bullet-point::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #a5b4fc;
        }
        
        .bullet-point strong {
          margin-right: 4px;
          color: #e0e7ff;
        }
        
        .numbered-item {
          margin: 8px 0 8px 12px;
          padding-left: 24px;
          position: relative;
        }
        
        .message-paragraph {
          margin: 12px 0;
        }
        
        .message-paragraph:first-child {
          margin-top: 0;
        }
        
        .message-paragraph:last-child {
          margin-bottom: 0;
        }
        
        .user-message {
          line-height: 1.5;
          font-size: 15px;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background-color: #1e293b;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-content {
          text-align: center;
        }

        .modal-content p {
          margin-bottom: 20px;
          color: #e2e8f0;
          font-size: 16px;
          line-height: 1.5;
        }

        .modal-button {
          background-color: #4f46e5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .modal-button:hover {
          background-color: #4338ca;
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