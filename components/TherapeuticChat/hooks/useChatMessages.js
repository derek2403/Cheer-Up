import { useState, useEffect, useRef } from 'react';

const useChatMessages = () => {
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
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    
    // Extract the input value
    const userInput = input || e.target?.querySelector('input')?.value;
    
    if (!userInput || userInput.trim() === '') return;
    
    // Add user message with proper formatting
    const userMessage = { 
      text: userInput,
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    
    // Add loading message
    const loadingMessage = {
      text: "Thinking...",
      sender: 'bot',
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);
    
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
          query: userInput,
          messages: apiMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      
      // Remove loading message and add assistant message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, { 
          text: data.answer, 
          sender: 'bot' 
        }];
      });
    } catch (error) {
      console.error('Error:', error);
      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, { 
          text: `**Error**\n\nI apologize, but I encountered an issue processing your message. Please try again.`, 
          sender: 'bot' 
        }];
      });
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return {
    messages,
    setMessages,
    loading,
    input,
    setInput,
    handleSubmitMessage,
    messagesEndRef
  };
};

export default useChatMessages; 