import React from 'react';
import PolicyManagement from './PolicyManagement';
import styles from './SystemSettings.module.css';

const SystemSettings = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>System Settings</h1>
          <p className={styles.subtitle}>Manage customer privacy policy, terms, and legal disclosures.</p>
        </div>
      </header>

      <div className={styles.tabs} role="tablist">
        <button 
          type="button" 
          role="tab" 
          aria-selected={true}
          className={`${styles.tab} ${styles.tabActive}`}
        >
          Privacy Policy
        </button>
      </div>

      <PolicyManagement />
    </div>
  );
};

export default SystemSettings;
