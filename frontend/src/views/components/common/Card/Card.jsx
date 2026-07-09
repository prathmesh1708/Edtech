import React from 'react';
import styles from './Card.module.css';

/**
 * Card — Container component with elevation and hover effects
 */
const Card = ({
  variant = 'default',
  size = 'md',
  clickable = false,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const classNames = [
    styles.card,
    styles[variant],
    styles[size],
    clickable ? styles.clickable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

/**
 * FeatureCard — Pre-styled card for feature/tool display
 */
export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color = '#4F6EF7',
  onClick,
  className = '',
  ...props
}) => {
  return (
    <Card clickable={!!onClick} onClick={onClick} className={`${styles.featureCard} ${className}`} {...props}>
      <div
        className={styles.featureIcon}
        style={{ background: `${color}14`, color }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <h4 className={styles.featureTitle}>{title}</h4>
      <p className={styles.featureDesc}>{description}</p>
    </Card>
  );
};

export default Card;
