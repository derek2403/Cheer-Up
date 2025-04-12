import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Header.module.css';
import { ConnectWallet } from './ConnectWallet';

export default function header() {
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
          <ul className="flex gap-6">
            <li><Link href="/room" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">Room</Link></li>
            <li><Link href="/chatbot" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">Chatbot</Link></li>
            <li><Link href="/rack" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">Rack</Link></li>
          </ul>
        </nav>

        <div className={styles.contactButton}>
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}