import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import styles from './CustomSelect.module.css';

const CustomSelect = ({
  label,
  value,
  options = [],
  onChange,
  searchable = false,
  placeholder = 'Select an option',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to { id, name, state, code, subtitle }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { id: String(opt), name: String(opt) };
    }
    return {
      id: String(opt.id ?? opt.value ?? ''),
      name: opt.name ?? opt.label ?? String(opt.id),
      state: opt.state ?? opt.region ?? '',
      code: opt.code ?? opt.badge ?? '',
      subtitle: opt.subtitle ?? opt.state ?? opt.fullName ?? ''
    };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.id) === String(value)) || normalizedOptions[0];

  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      opt.name.toLowerCase().includes(term) ||
      (opt.state && opt.state.toLowerCase().includes(term)) ||
      (opt.code && opt.code.toLowerCase().includes(term)) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(term))
    );
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionId) => {
    if (onChange) {
      onChange(optionId);
    }
    setIsOpen(false);
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      {label && <span className={styles.label}>{label}</span>}

      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles.triggerContent}>
          <span className={styles.triggerName}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          {selectedOption?.state && (
            <span className={styles.triggerSub}>({selectedOption.state})</span>
          )}
        </div>
        <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {searchable && (
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.clearSearch}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <div className={styles.optionsList}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.id) === String(value);
                return (
                  <div
                    key={opt.id}
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                    onClick={() => handleSelect(opt.id)}
                  >
                    <div className={styles.optionContent}>
                      <span className={styles.optionName}>{opt.name}</span>
                      {opt.state && <span className={styles.optionState}>{opt.state}</span>}
                      {opt.subtitle && !opt.state && (
                        <span className={styles.optionState}>{opt.subtitle}</span>
                      )}
                    </div>

                    <div className={styles.optionRight}>
                      {opt.code && <span className={styles.badge}>{opt.code}</span>}
                      {isSelected && <Check size={16} className={styles.checkIcon} />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noResults}>No matching options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
