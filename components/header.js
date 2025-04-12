import React from 'react';
import Link from 'next/link';
import styles from '../styles/Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>UIIA</span>
          </Link>
        </div>
        
        <nav className={styles.navigation}>
          <ul>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/customers">Customers stories</Link></li>
            <li><Link href="/benefits">Benefits</Link></li>
            <li>
              <Link href="/contact" className={styles.contactButtonLink}>
                <button className={styles.contactButton}>Contact</button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
