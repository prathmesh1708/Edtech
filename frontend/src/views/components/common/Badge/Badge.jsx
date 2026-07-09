import React from 'react';
import styles from './Badge.module.css';

const Badge = ({
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  const classNames = [styles.badge, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
};

export default Badge;
