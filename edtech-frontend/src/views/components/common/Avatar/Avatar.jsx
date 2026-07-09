import React from 'react';
import { User } from 'lucide-react';
import styles from './Avatar.module.css';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <div className={`${styles.avatar} ${styles[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
      )}
    </div>
  );
};

export default Avatar;
