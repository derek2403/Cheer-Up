import Head from 'next/head';
import Chatbot from '../components/chatbot';
import styles from '../styles/Home.module.css';

export default function ChatbotPage() {
  return (
    <div className={styles.container}>
      <Head>
        <title>AI Chatbot</title>
        <meta name="description" content="A futuristic AI chatbot interface" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        <Chatbot />
      </main>
    </div>
  );
} 