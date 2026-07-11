import React from 'react';
import styles from './Logo.module.css';

const Logo = ({ dark = false, className = '' }) => {
  return (
    <div className={`${styles.logo} ${dark ? styles.dark : ''} ${className}`}>
      <img 
        src={dark ? "/assets/images/logo-dark.png" : "/assets/images/logo.png"} 
        alt="Study Wisely Logo" 
        className={styles.logoImage} 
      />
    </div>
  );
};

export default Logo;
