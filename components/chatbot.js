import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Chatbot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      text: `**Welcome to Our Therapeutic Space**

I want to start by acknowledging your courage in reaching out for support. It takes a lot of strength to admit when we need help, and I'm honored that you've chosen to share this journey with me. As your trusted mental health professional, I'm here to provide a safe, non-judgmental, and empathetic space for you to explore your thoughts, feelings, and experiences.

It sounds like you might be experiencing a difficult time, and I want you to know that you're not alone. Many people face challenges that can feel overwhelming, but with the right support and guidance, it's possible to navigate these difficulties and find a path towards healing and growth. I'm committed to walking alongside you, offering my expertise and support every step of the way.

As we begin this therapeutic journey together, I want to assure you that everything discussed in this space will remain confidential and respected.

Feel free to share what's on your mind, or if you prefer, you can start by uploading any relevant documents that might help me understand your situation better.`, 
      sender: 'bot',
      type: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientColors, setGradientColors] = useState({
    color1: 'rgba(255, 255, 255, 0.8)',
    color2: 'rgba(173, 216, 230, 0.9)'
  });
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Animate gradient background
  useEffect(() => {
    const interval = setInterval(() => {
      // Change gradient angle
      setGradientAngle(prev => (prev + 1) % 360);
      
      // Occasionally change gradient colors slightly
      if (Math.random() > 0.95) {
        setGradientColors({
          color1: `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`,
          color2: `rgba(${173 + Math.floor(Math.random() * 30)}, ${216 + Math.floor(Math.random() * 30)}, ${230 + Math.floor(Math.random() * 25)}, 0.9)`
        });
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message with proper formatting
    const userMessage = { 
      text: input,
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    
    try {
      // Format messages for the API
      const apiMessages = messages
        .concat(userMessage)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: input,
          messages: apiMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      
      // Add assistant message to chat with proper formatting
      setMessages(prev => [...prev, { 
        text: data.answer, 
        sender: 'bot' 
      }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat with proper formatting
      setMessages(prev => [...prev, { 
        text: `**Error**\n\nI apologize, but I encountered an issue processing your message. Please try again.`, 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };
  
  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };
  
  const handleFiles = async (newFiles) => {
    // Filter for supported file types
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    // Check if any file is not supported
    const validFiles = [];
    const invalidFiles = [];
    
    newFiles.forEach(file => {
      if (supportedTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });
    
    // If no valid files were found, show a single error message
    if (validFiles.length === 0 && invalidFiles.length > 0) {
      setMessages(prev => [...prev, { 
        text: `**File Upload Error**\n\nSorry, I can only accept PDF, JPG, PNG, TXT, DOC, and DOCX files.`, 
        sender: 'bot' 
      }]);
      return;
    }
    
    // Show a message if some files were filtered out
    if (invalidFiles.length > 0 && validFiles.length > 0) {
      setMessages(prev => [...prev, { 
        text: `**File Upload Warning**\n\nSome files were not supported and were skipped. I only accept PDF, JPG, PNG, TXT, DOC, and DOCX files.`, 
        sender: 'bot' 
      }]);
    }
    
    // No files to process
    if (validFiles.length === 0) {
      return;
    }
    
    setLoading(true);
    
    // Combine all file processing results into a single message
    let processedCount = 0;
    let failedCount = 0;
    const processedFiles = [];
    const failedFiles = [];
    
    for (const file of validFiles) {
      try {
        // Add file to the list for display
        setFiles(prev => [...prev, file]);
        
        // Create form data for the file
        const formData = new FormData();
        formData.append('document', file);
        
        // First parse the document
        const parseResponse = await fetch('/api/parse', {
          method: 'POST',
          body: formData,
        });

        if (!parseResponse.ok) {
          throw new Error('Failed to parse document');
        }

        const parseData = await parseResponse.json();

        // Then ingest the parsed content
        const ingestResponse = await fetch('/api/ingest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: file.name,
            htmlContent: parseData.content.html
          }),
        });

        if (!ingestResponse.ok) {
          throw new Error('Failed to process document');
        }
        
        processedCount++;
        processedFiles.push(file.name);
      } catch (error) {
        console.error('Error processing file:', error);
        // Remove the file from the list if processing failed
        setFiles(prev => prev.filter(f => f.name !== file.name));
        failedCount++;
        failedFiles.push(file.name);
      }
    }
    
    // Show single success message for all processed files
    if (processedCount > 0) {
      const fileNames = processedFiles.join('", "');
      const message = processedCount === 1
        ? `**Document Processed Successfully**\n\nI've processed "${fileNames}". I'll use this information to provide more personalized responses.`
        : `**Documents Processed Successfully**\n\nI've processed ${processedCount} files:\n- "${fileNames}"\n\nI'll use this information to provide more personalized responses.`;
      
      setMessages(prev => [...prev, { text: message, sender: 'bot' }]);
    }
    
    // Show single error message for all failed files
    if (failedCount > 0) {
      const fileNames = failedFiles.join('", "');
      const message = failedCount === 1
        ? `**Document Processing Error**\n\nSorry, I couldn't process "${fileNames}". Please try again or upload a different file.`
        : `**Document Processing Error**\n\nSorry, I couldn't process ${failedCount} files:\n- "${fileNames}"\n\nPlease try again or upload different files.`;
      
      setMessages(prev => [...prev, { text: message, sender: 'bot' }]);
    }
    
    setLoading(false);
  };
  
  const removeFile = async (index) => {
    const fileToRemove = files[index];
    
    try {
      // Remove from UI first
      setFiles(prev => prev.filter((_, i) => i !== index));
      
      // Then attempt to delete vectors associated with this file
      const response = await fetch('/api/delete-vectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: fileToRemove.name
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Add error message to chat
        setMessages(prev => [...prev, {
          text: `**Document Removal Error**\n\nFailed to remove "${fileToRemove.name}" from memory. Please try again.`,
          sender: 'bot'
        }]);
        // Add the file back to the list since deletion failed
        setFiles(prev => [...prev, fileToRemove]);
        return;
      }

      // Add success message to chat
      setMessages(prev => [...prev, {
        text: `**Document Removed Successfully**\n\nI've removed "${fileToRemove.name}" and its information from my memory.`,
        sender: 'bot'
      }]);

    } catch (error) {
      console.error('Error removing file:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        text: `**Document Removal Error**\n\nFailed to remove "${fileToRemove.name}" from memory. Please try again.`,
        sender: 'bot'
      }]);
      // Add the file back to the list since deletion failed
      setFiles(prev => [...prev, fileToRemove]);
    }
  };
  
  return (
    <div className={styles.chatbotWrapperLarge}>
      {/* Context Sharing Section */}
      <div className={styles.contextSection}>
        <div className={styles.contextGlow}></div>
        <div className={styles.contextContent}>
          <div className={styles.contextHeader}>
            <svg className={styles.contextIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className={styles.contextTitle}>✨ Share Your Context ✨</h2>
          </div>
          
          <p className={styles.contextDescription}>
            Upload personal documents that can help me understand you better:
          </p>
          
          <ul className={styles.contextList}>
            <li>
              <span className={styles.emojiIcon}>📝</span>
              Journal entries or personal reflections
            </li>
            <li>
              <span className={styles.emojiIcon}>🩺</span>
              Medical or therapy history (if comfortable sharing)
            </li>
            <li>
              <span className={styles.emojiIcon}>🌟</span>
              Important life events or experiences
            </li>
            <li>
              <span className={styles.emojiIcon}>🎯</span>
              Personal goals or aspirations
            </li>
            <li>
              <span className={styles.emojiIcon}>📚</span>
              Any other documents relevant to your journey
            </li>
          </ul>
          
          <div className={styles.securityNoteContainer}>
            <span className={styles.emojiIcon}>🔒</span>
            <p className={styles.securityNote}>
              Your documents are processed securely and used only to provide more personalized support.
            </p>
          </div>
          
          <div 
            className={`${styles.contextDropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <div className={styles.dropZoneContent}>
              <div className={styles.uploadIconContainer}>
                <span className={styles.uploadEmoji}>📤</span>
                <div className={styles.uploadGlow}></div>
              </div>
              <p>Drop your document here or click to browse</p>
              <span>Supported formats: PDF, JPG, PNG, TXT, DOC, DOCX</span>
            </div>
          </div>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
          />
          
          {/* File List */}
          {files.length > 0 && (
            <div className={styles.fileList}>
              <div className={styles.fileListHeader}>
                <span className={styles.emojiIcon}>📎</span>
                <h3>Uploaded Files</h3>
              </div>
              {files.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <div className={styles.fileIcon}>
                    {file.type.includes('image') ? (
                      <span className={styles.emojiIcon}>🖼️</span>
                    ) : file.type.includes('pdf') ? (
                      <span className={styles.emojiIcon}>📄</span>
                    ) : (
                      <span className={styles.emojiIcon}>📃</span>
                    )}
                  </div>
                  <div className={styles.fileName}>{file.name}</div>
                  <button 
                    className={styles.removeFileBtn}
                    onClick={() => removeFile(index)}
                    aria-label="Remove file"
                  >
                    <span className={styles.emojiIcon}>❌</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div 
        className={styles.chatbotContainer}
        style={{
          background: `linear-gradient(${gradientAngle}deg, ${gradientColors.color1}, ${gradientColors.color2})`
        }}
      >
        <div className={styles.chatHeader}>
          <h2>Your Therapeutic Space</h2>
          <div className={styles.statusIndicator}></div>
        </div>
        
        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${styles[message.sender]} ${message.type === 'welcome' ? styles.welcome : ''}`}
            >
              {message.text.split('\n\n').map((paragraph, i) => {
                // Handle section titles (bolded text)
                if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                  return (
                    <h3 key={i} className={styles.sectionTitle}>
                      {paragraph.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                
                // Handle bullet points with emphasis
                if (paragraph.trim().startsWith('- **')) {
                  const [title, ...content] = paragraph.substring(2).split('**');
                  return (
                    <div key={i} className={styles.bulletPoint}>
                      <strong>{title.trim()}</strong>
                      {content.join('').replace(/\*\*/g, '')}
                    </div>
                  );
                }

                // Handle regular bullet points
                if (paragraph.trim().startsWith('- ')) {
                  return (
                    <div key={i} className={styles.bulletPoint}>
                      {paragraph.substring(2)}
                    </div>
                  );
                }

                // Handle numbered items
                if (paragraph.match(/^\d+\.\s/)) {
                  return (
                    <div key={i} className={styles.numberedItem}>
                      {paragraph}
                    </div>
                  );
                }

                // Handle regular paragraphs
                return paragraph.trim() ? (
                  <p key={i} className={styles.messageParagraph}>
                    {paragraph}
                  </p>
                ) : null;
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className={styles.messageInput}
            disabled={loading}
          />
          <button type="submit" className={styles.sendButton} disabled={loading || !input.trim()}>
            {loading ? (
              <div className={styles.loadingSpinner}></div>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
      </div>
      
      <style jsx>{`
        .${styles.loadingSpinner} {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .${styles.sectionTitle} {
          font-size: 17px;
          font-weight: 600;
          margin: 16px 0 12px 0;
          color: #f8fafc;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 8px;
        }
        
        .${styles.bulletPoint} {
          margin: 8px 0 8px 12px;
          position: relative;
          padding-left: 16px;
        }
        
        .${styles.bulletPoint}::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #a5b4fc;
        }
        
        .${styles.bulletPoint} strong {
          margin-right: 4px;
          color: #e0e7ff;
        }
        
        .${styles.numberedItem} {
          margin: 8px 0 8px 12px;
          padding-left: 24px;
          position: relative;
        }
        
        .${styles.messageParagraph} {
          margin: 12px 0;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
