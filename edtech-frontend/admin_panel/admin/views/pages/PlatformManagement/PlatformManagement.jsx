import React from 'react';
import { Save, Globe, Shield, Bell, CreditCard } from 'lucide-react';
import styles from './PlatformManagement.module.css';

const PlatformManagement = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Platform Settings</h1>
          <p className={styles.subtitle}>Configure global settings, security, and preferences.</p>
        </div>
        <button className={styles.primaryButton}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <button className={`${styles.navItem} ${styles.active}`}>
              <Globe size={18} />
              <span>General Settings</span>
            </button>
            <button className={styles.navItem}>
              <Shield size={18} />
              <span>Security & Roles</span>
            </button>
            <button className={styles.navItem}>
              <Bell size={18} />
              <span>Notifications</span>
            </button>
            <button className={styles.navItem}>
              <CreditCard size={18} />
              <span>Billing & Plans</span>
            </button>
          </nav>
        </aside>

        <main className={styles.content}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>General Platform Info</h2>
            <p className={styles.cardSubtitle}>Update your main platform details and public branding.</p>
            
            <div className={styles.formGroup}>
              <label>Platform Name</label>
              <input type="text" defaultValue="Study Wisely Platform" className={styles.input} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Support Email</label>
              <input type="email" defaultValue="support@studywisely.in" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>Default Currency</label>
              <select className={styles.select}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlatformManagement;
