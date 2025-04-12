import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../styles/Landing.module.css';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const mekaCards = [
    { id: 1, image: '/landing/nethermind-removebg-preview.png' },
    { id: 2, image: '/landing/near-removebg-preview.png' },
    { id: 3, image: '/landing/image-removebg-preview (1).png' },
    { id: 4, image: '/landing/upstage-color.png' }
    
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Create multiple sets of cards to ensure no empty spaces
  const renderCards = () => {
    // Create 6 sets of cards to ensure enough content for scrolling
    const duplicatedCards = [];
    for (let i = 0; i < 6; i++) {
      mekaCards.forEach((card, index) => {
        // Add custom padding for specific images
        const customStyle = {};
        if (card.image.includes('image-removebg-preview (1)') || card.image.includes('upstage-color')) {
          customStyle.padding = '35px';
        }
        
        duplicatedCards.push(
          <div 
            key={`set-${i}-card-${card.id}`} 
            className={styles.card}
            style={{ '--card-index': (i * mekaCards.length) + index }}
          >
            <img 
              src={card.image} 
              alt={`Meka ${card.id}`} 
              style={customStyle}
            />
          </div>
        );
      });
    }
    return duplicatedCards;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Cure Me Baby</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.backgroundGradient}></div>

      <main className={`${styles.main} ${isLoaded ? styles.loaded : ''}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>Cure Me Baby</h1>
          <p className={styles.subtitle}>Your personal health companion for all your wellness needs</p>
          
          <Link href="/room" className={styles.enterButton}>
            <span>ENTER</span>
          </Link>
          
          <div className={styles.cardGridContainer}>
            <div className={styles.cardGrid}>
              {renderCards()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
