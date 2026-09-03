import React, { useContext } from 'react';
import ThemeContext from '../../../../models/context/ThemeContext';
import styles from './Logo.module.css';

const Logo = ({ dark, className = '', alt = 'Study Wisely' }) => {
  const themeContext = useContext(ThemeContext);
  
  // If dark prop is explicitly passed as boolean, respect it; otherwise use active theme from context or DOM
  const isDarkMode = typeof dark === 'boolean' 
    ? dark 
    : (themeContext ? themeContext.isDark : (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'));

  return (
    <div className={`${styles.logo} ${isDarkMode ? styles.dark : ''} ${className}`}>
      <img 
        src={isDarkMode ? "/assets/images/logo-dark.png" : "/assets/images/logo.png"} 
        alt={alt} 
        className={styles.logoImage} 
      />
    </div>
  );
};

export default Logo;
