import Head from 'next/head';
import Header from '../components/header';
import Chatbot from '../components/chatbot';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';

export default function ChatbotPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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
    
    return () => {
      clearTimeout(timer);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

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
        setModalMessage("Vectors successfully deleted!");
        setShowModal(true);
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
    <div className={styles.container}>
      <Head>
        <title>hiAI Chatbot</title>
        <meta name="description" content="A futuristic AI chatbot interface" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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

      <Header />
      
      <main className={`${styles.main} ${isLoading ? styles.pageLoading : styles.pageLoaded}`}>
        {/* Add a spacer element at the top */}
        <div className={styles.topSpacer}></div>
        
        <div className={styles.actionButtons}>
          <button 
            onClick={handleClearVectors}
            className={styles.deleteVectorsBtn}
          >
            Delete Vectors
          </button>
        </div>
        
        <Chatbot />
      </main>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        body {
          scroll-padding-top: 80px; /* Adjust based on your header height */
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

      <style jsx>{`
        .${styles.actionButtons} {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          max-width: 850px;
          margin: 0 0 15px auto;
        }

        .${styles.deleteVectorsBtn} {
          background-color: #6d28d9;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .${styles.deleteVectorsBtn}:hover {
          background-color: #5b21b6;
        }
      `}</style>
    </div>
  );
} 