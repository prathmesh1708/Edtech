import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import styles from './Topbar.module.css';

const Topbar = () => {
  return (
    <header className={styles.topbar}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input 
          type="text" 
          placeholder="Search students, courses, or settings..." 
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>
        
        <div className={styles.profileMenu}>
          <div className={styles.avatar}>
            <User size={20} />
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.name}>Admin User</span>
            <span className={styles.role}>Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
