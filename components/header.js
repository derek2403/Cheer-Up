import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/cureLogo.png" 
              alt="Cure Logo" 
              width={30} 
              height={30}
              priority
            />
            <span>CureMeBaby</span>
          </Link>
        </div>

        <nav className={styles.navigation}>
          <ul>
            <li><Link href="/room">Room</Link></li>
            <li><Link href="/chatbot">Chatbot</Link></li>
            <li><Link href="/rack">Rack</Link></li>
          </ul>
        </nav>

        <button className={styles.contactButton}>
          Connect Wallet
        </button>
      </div>
    </header>
  );
}