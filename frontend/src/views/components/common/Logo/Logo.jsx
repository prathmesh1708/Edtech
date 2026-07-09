import React from 'react';
import { BookOpen, Wifi, Smartphone } from 'lucide-react';
import styles from './Logo.module.css';

const Logo = ({ dark = false, className = '' }) => {
  return (
    <div className={`${styles.logo} ${dark ? styles.dark : ''} ${className}`}>
      <div className={styles.iconContainer}>
        <Smartphone className={styles.phoneIcon} strokeWidth={2} />
        <Wifi className={styles.wifiIcon} strokeWidth={3} />
        <BookOpen className={styles.bookIcon} strokeWidth={2} />
      </div>
      <div className={styles.textContainer}>
        <span className={styles.brandName}>STUDYWISELY</span>
        <span className={styles.brandUrl}>www.studywisely.in</span>
      </div>
    </div>
  );
};

export default Logo;
