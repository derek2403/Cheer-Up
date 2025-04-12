import Head from 'next/head';
import Header from '../components/header';
import TherapeuticChat from '../components/TherapeuticChat';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';

export default function ChatbotPage() {
  const [isLoading, setIsLoading] = useState(true);

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
      </main>

      <style jsx global>{`
        /* Reset default browser margins/padding */
        html,
        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box; /* Include padding and border in element's total width and height */
        }

        /* Ensure the container's background behavior */
        html {
          height: 100%; /* Ensure html takes full height */
        }
        
        body {
          min-height: 100%; /* Ensure body takes at least full height */
          scroll-padding-top: 80px; /* Existing style */
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

        .${styles.main} {
          margin-top: 80px; /* Add spacing below header */
        }
      `}</style>
    </div>
  );
} 