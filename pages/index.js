import Head from 'next/head';
import Header from '../components/header';
import Chatbot from '../components/chatbot';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title> Chatbot</title>
        <meta name="description" content="A futuristic AI chatbot interface" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span>AI Assistant</span>
        </h1>
        
        <Chatbot />
      </main>
    </div>
  );
}
