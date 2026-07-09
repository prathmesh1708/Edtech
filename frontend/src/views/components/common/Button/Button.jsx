import React from 'react';
import styles from './Button.module.css';

/**
 * Button — Primary UI component for user interactions
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'accent'|'outline'|'ghost'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.loading
 * @param {boolean} props.disabled
 * @param {boolean} props.fullWidth
 * @param {React.ReactNode} props.iconLeft
 * @param {React.ReactNode} props.iconRight
 * @param {string} props.className
 * @param {Function} props.onClick
 * @param {React.ReactNode} props.children
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  className = '',
  children,
  ...props
}) => {
  const classNames = [
    styles.btn,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={disabled || loading} {...props}>
      {loading && <span className={styles.spinner} />}
      {!loading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {children}
      {!loading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
};

export default Button;
