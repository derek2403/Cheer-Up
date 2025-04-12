import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../styles/Landing.module.css';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.videoContainer}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className={styles.backgroundVideo}
        >
          <source src="/44.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className={styles.overlay}></div>
      </div>

      <main className={`${styles.main} ${isLoaded ? styles.loaded : ''}`}>
        <div className={styles.content}>
          <Link href="/chatbot" className={styles.startButton}>
            <span className={styles.buttonText}>Start Here</span>
            <svg className={styles.arrow} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
