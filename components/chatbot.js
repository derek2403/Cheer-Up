import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Chatbot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm yu, how can I help you", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientColors, setGradientColors] = useState({
    color1: 'rgba(255, 255, 255, 0.8)',
    color2: 'rgba(173, 216, 230, 0.9)'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  
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
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Add a message showing the file was attached
      setMessages(prev => [...prev, { 
        text: `File attached: ${file.name}`, 
        sender: 'user',
        isFileAttachment: true 
      }]);
    }
  };
  
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '' && !selectedFile) return;
    
    // Add user message if there's text input
    if (input.trim() !== '') {
      setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    }
    
    // Simulate bot response (replace with actual API call in production)
    setTimeout(() => {
      let responseText = input.trim() !== '' 
        ? `I received your message: "${input}"` 
        : 'I received your file';
        
      if (selectedFile) {
        responseText += input.trim() !== '' 
          ? ` and your file: ${selectedFile.name}` 
          : `: ${selectedFile.name}`;
      }
      
      setMessages(prev => [...prev, { 
        text: responseText, 
        sender: 'bot' 
      }]);
    }, 1000);
    
    setInput('');
    setSelectedFile(null);
  };
  
  return (
    <div 
      className={styles.chatbotContainer}
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${gradientColors.color1}, ${gradientColors.color2})`
      }}
    >
      <div className={styles.chatHeader}>
        <h2>AI Hello! I'm yu, how can I help you</h2>
        <div className={styles.statusContainer}>
          <div className={styles.statusIndicator}></div>
          <span className={styles.modelName}>llama 3.1</span>
        </div>
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
        
        <button 
          type="button" 
          onClick={handleFileButtonClick}
          className={styles.uploadButton}
          title="Upload file"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx"
        />
        
        <button type="submit" className={styles.sendButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
