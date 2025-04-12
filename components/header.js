import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

const Header = () => {
  const router = useRouter();
  
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          <span>Virtual Space</span>
        </Link>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={router.pathname === '/' ? styles.active : ''}>
            <Link href="/">Home</Link>
          </li>
          <li className={router.pathname === '/room' ? styles.active : ''}>
            <Link href="/room">Room</Link>
          </li>
          <li className={router.pathname === '/rack' ? styles.active : ''}>
            <Link href="/rack">Rack</Link>
          </li>
        </ul>
      </nav>
      
      <div className={styles.controls}>
        <div className={styles.controlsInfo}>
          <span>WASD or Arrow Keys to move</span>
        </div>
      </div>
    </header>
  );
};

export default Header;