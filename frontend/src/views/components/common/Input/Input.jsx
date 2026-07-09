import React from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  disabled,
  iconLeft,
  iconRight,
  size = 'md',
  textarea = false,
  className = '',
  id,
  name,
  required,
  ...props
}) => {
  const groupClass = [
    styles.inputGroup,
    styles[size],
    error ? styles.error : '',
    success ? styles.success : '',
    iconLeft ? styles.hasIconLeft : '',
    iconRight ? styles.hasIconRight : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={groupClass}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        {textarea ? (
          <textarea
            id={inputId}
            name={name}
            className={`${styles.input} ${styles.textarea}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            className={styles.input}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            {...props}
          />
        )}
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
};

export default Input;
