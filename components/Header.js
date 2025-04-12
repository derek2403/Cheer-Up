import React from 'react';
import Link from 'next/link';
import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link href="/">BuidlAI</Link>
        </div>
        
        <nav className={styles.navigation}>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/memory-wall">Memory Wall</Link></li>
            <li><Link href="/model">Models</Link></li>
          </ul>
        </nav>

        <button className={styles.contactButton}>
          Contact Us
        </button>
      </div>
    </header>
  );
}