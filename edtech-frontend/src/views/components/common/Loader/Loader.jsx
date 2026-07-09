import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ fullScreen = false, text = 'Loading...', variant = 'dots' }) => {
  const Wrapper = fullScreen ? 'div' : 'div';
  const wrapperClass = fullScreen ? styles.loaderOverlay : styles.loaderInline;

  return (
    <div className={wrapperClass}>
      {fullScreen && (
        <div className={styles.logoWrapper}>
          <img src="/assets/images/logo.png" alt="Study Wisely" />
        </div>
      )}
      {variant === 'dots' ? (
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      ) : (
        <div className={`${styles.spinner} ${!fullScreen ? styles.spinnerSm : ''}`} />
      )}
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loader;
