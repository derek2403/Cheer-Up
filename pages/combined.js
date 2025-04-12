import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DocumentParserComponent } from '../components/DocumentParser/DocumentParserComponent';

export default function CombinedPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Load conversations from localStorage on initial render
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatConversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed);
      if (parsed.length > 0) {
        setActiveConversationId(parsed[0].id);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatConversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null;

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      title: 'New Chat',
      messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const updateConversationTitle = (id, title) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title } : conv
    ));
  };

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(conversations[1]?.id || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim() || !activeConversationId) return;
    
    setLoading(true);
    
    const userMessage = { role: 'user', content: query };
    
    // Update conversation with user message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    ));
    
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
      
      const assistantMessage = { role: 'assistant', content: data.answer };
      
      // Update conversation with assistant message
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      ));

      // Update title of new conversations after first message
      if (conversations.find(c => c.id === activeConversationId)?.title === 'New Chat') {
        updateConversationTitle(activeConversationId, query.slice(0, 30) + (query.length > 30 ? '...' : ''));
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      ));
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

      const clearMessage = { role: 'assistant', content: 'All vectors have been cleared. Please re-upload your documents.' };
      if (activeConversationId) {
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversationId 
            ? { ...conv, messages: [...conv.messages, clearMessage] }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: 'assistant', content: 'Failed to clear vectors. Please try again.' };
      if (activeConversationId) {
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversationId 
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        ));
      }
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Document Parser & Chatbot</title>
        <meta name="description" content="Combined document parsing and chatbot demo" />
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
          <div className="chat-sidebar">
            <button 
              onClick={createNewConversation}
              className="new-chat-button"
            >
              + New Chat
            </button>
            <div className="conversations-list">
              {conversations.map(conv => (
                <div 
                  key={conv.id} 
                  className={`conversation-item ${conv.id === activeConversationId ? 'active' : ''}`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <span className="conversation-title">{conv.title}</span>
                  <button 
                    className="delete-conversation"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-main">
            <h2>Chat with your Documents</h2>
            
            <div className="chat-container">
              {!activeConversation || activeConversation.messages.length === 0 ? (
                <div className="empty-state">
                  Ask a question about your documents
                </div>
              ) : (
                <div className="messages">
                  {activeConversation.messages.map((message, index) => (
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
                disabled={loading || !activeConversationId}
              />
              <button type="submit" disabled={loading || !query.trim() || !activeConversationId}>
                {loading ? 'Thinking...' : 'Send'}
              </button>
            </form>
          </div>
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
          padding: 20px;
        }
        
        .main-content {
          flex: 1;
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          align-items: center;
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
        }
        
        .chatbot-section {
          display: flex;
          gap: 20px;
          width: 100%;
          margin-bottom: 40px;
        }

        .chat-sidebar {
          width: 260px;
          background-color: #1e1e1e;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: fit-content;
        }

        .new-chat-button {
          width: 100%;
          padding: 10px;
          background-color: #2a2a2a;
          border: 1px solid #333;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .new-chat-button:hover {
          background-color: #333;
        }

        .conversations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 500px;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: #2a2a2a;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .conversation-item:hover {
          background-color: #333;
        }

        .conversation-item.active {
          background-color: #0070f3;
        }

        .conversation-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }

        .delete-conversation {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 18px;
          padding: 0 4px;
        }

        .delete-conversation:hover {
          color: #dc2626;
        }

        .chat-main {
          flex: 1;
          background-color: #1e1e1e;
          border-radius: 8px;
          padding: 20px;
        }

        h2 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #fff;
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
          width: 100%;
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
          white-space: nowrap;
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

        #__next {
          min-height: 100vh;
          background-color: #121212;
        }
      `}</style>
    </div>
  );
} 