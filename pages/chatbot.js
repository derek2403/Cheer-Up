import Head from 'next/head';
import Header from '../components/Header';
import TherapeuticChat from '../components/TherapeuticChat';
import styles from '../styles/Home.module.css';
import { useState, useEffect, useRef } from 'react';

export default function ChatbotPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const modalRef = useRef(null);

  // Add smooth scroll behavior and zoom-in animation when the page loads
  useEffect(() => {
    // Set scroll behavior to smooth for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Scroll to top when the page loads
    window.scrollTo(0, 0);
    
    // Trigger the zoom-in animation
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.documentElement.style.scrollBehavior = 'smooth';
    }, 100);
    
    // Add click outside listener for modal
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearTimeout(timer);
      document.documentElement.style.scrollBehavior = '';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEvaluateImprove = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setProcessingMessage('Running evaluation and improvement script...');
      setAiSuggestions(''); // Clear previous suggestions
      
      const response = await fetch('/api/run-script', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAiSuggestions(data.aiSuggestions || 'No AI suggestions available.');
        setProcessingMessage('✅ Evaluation complete! Click "View AI Suggestions" to see how the AI can improve.');
        
        // Keep the success message and button visible
        setTimeout(() => {
          setIsProcessing(false);
        }, 500);
      } else {
        setProcessingMessage(`❌ Error: ${data.error || 'Failed to execute script'}`);
        // Reset after 3 seconds for errors
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingMessage('');
        }, 3000);
      }
    } catch (error) {
      setProcessingMessage(`❌ Error: ${error.message}`);
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingMessage('');
      }, 3000);
    }
  };

  const openSuggestionsModal = () => {
    setShowSuggestions(true);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>hiAI Chatbot</title>
        <meta name="description" content="A futuristic AI chatbot interface" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />
      
      <main className={`${styles.main} ${isLoading ? styles.pageLoading : styles.pageLoaded}`}>
        <TherapeuticChat />
        
        {/* Evaluate and Improve Button */}
        <div className="evaluateButtonContainer">
          <button 
            className={`evaluateButton ${isProcessing ? 'processing' : ''}`}
            onClick={handleEvaluateImprove}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loadingSpinner"></span>
                Processing...
              </>
            ) : 'Evaluate & Improve'}
          </button>
          
          {processingMessage && (
            <div className="processingMessage">{processingMessage}</div>
          )}
          
          {aiSuggestions && !isProcessing && (
            <button 
              className="viewSuggestionsButton" 
              onClick={openSuggestionsModal}
            >
              View AI Suggestions
            </button>
          )}
        </div>
        
        {/* AI Suggestions Modal */}
        {showSuggestions && (
          <div className="modalOverlay">
            <div className="suggestionsModal" ref={modalRef}>
              <div className="modalHeader">
                <h3>AI Improvement Suggestions</h3>
                <button 
                  className="closeButton" 
                  onClick={() => setShowSuggestions(false)}
                >
                  ×
                </button>
              </div>
              <div className="modalContent">
                <div className="aiSuggestionsText">
                  {aiSuggestions.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="modalFooter">
                <button 
                  className="closeModalButton" 
                  onClick={() => setShowSuggestions(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          height: 100vh;
          overflow: hidden;
        }

        /* Set up proper viewport sizing */
        .${styles.container} {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .${styles.main} {
          flex: 1;
          margin-top: 80px;
          height: calc(100vh - 80px); /* Subtract header height */
          overflow: hidden;
          position: relative;
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .${styles.pageLoading} {
          opacity: 0;
          transform: scale(0.9);
        }
        
        .${styles.pageLoaded} {
          animation: zoomIn 1.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }

        /* Evaluate Button Styles */
        .evaluateButtonContainer {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .evaluateButton {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 180px;
          gap: 8px;
        }
        
        .evaluateButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }
        
        .evaluateButton:active {
          transform: translateY(0);
        }
        
        .evaluateButton.processing {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          cursor: not-allowed;
          opacity: 0.8;
        }
        
        .loadingSpinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .processingMessage {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-top: 12px;
          max-width: 350px;
          animation: fadeIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          line-height: 1.4;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* View Suggestions Button */
        .viewSuggestionsButton {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 180px;
          margin-top: 12px;
          animation: fadeIn 0.5s ease;
        }
        
        .viewSuggestionsButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }
        
        /* Modal Styles */
        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }
        
        .suggestionsModal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          animation: modalZoomIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        
        @keyframes modalZoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modalHeader h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1f2937;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
        }
        
        .closeButton {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .closeButton:hover {
          background-color: #f3f4f6;
          color: #111827;
        }
        
        .modalContent {
          padding: 24px;
          overflow-y: auto;
          max-height: calc(80vh - 140px);
        }
        
        .aiSuggestionsText {
          font-size: 1rem;
          line-height: 1.6;
          color: #374151;
        }
        
        .aiSuggestionsText p {
          margin-bottom: 16px;
        }
        
        .modalFooter {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }
        
        .closeModalButton {
          background-color: #f3f4f6;
          color: #111827;
          border: none;
          border-radius: 6px;
          padding: 10px 16px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .closeModalButton:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
} 