import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Chatbot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm yu, how can I help youu!!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientColors, setGradientColors] = useState({
    color1: 'rgba(255, 255, 255, 0.8)',
    color2: 'rgba(173, 216, 230, 0.9)'
  });
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    
    // Simulate bot response (replace with actual API call in production)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `I received your message: "${input}"`, 
        sender: 'bot' 
      }]);
    }, 1000);
    
    setInput('');
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
  
  const handleFiles = (newFiles) => {
    // Filter for supported file types
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validFiles = newFiles.filter(file => supportedTypes.includes(file.type));
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      
      // Add a message about the uploaded files
      setMessages(prev => [...prev, { 
        text: `You've shared ${validFiles.length} document${validFiles.length > 1 ? 's' : ''}. I'll use this context to provide more personalized responses.`, 
        sender: 'bot' 
      }]);
    } else if (newFiles.length > 0) {
      setMessages(prev => [...prev, { 
        text: `Sorry, I can only accept PDF, JPG, PNG, TXT, DOC, and DOCX files.`, 
        sender: 'bot' 
      }]);
    }
  };
  
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
          <h2>Your therapeutic space</h2>
          <div className={styles.statusIndicator}></div>
        </div>
        
        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${styles[message.sender]}`}
            >
              {message.text}
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
          />
          <button type="submit" className={styles.sendButton}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
