import React from 'react';
import styles from './DikshaFilters.module.css';

const MAX_SUBJECT_CHIPS = 16;

/**
 * DikshaFilters — content-type tabs and subject chips, both built from DIKSHA facets.
 */
const DikshaFilters = ({
  types = [],
  subjects = [],
  activeType = '',
  activeSubject = '',
  onTypeChange,
  onSubjectChange,
}) => {
  const visibleSubjects = subjects.slice(0, MAX_SUBJECT_CHIPS);
  // Keep the active subject visible even when it falls outside the top chips.
  if (activeSubject && !visibleSubjects.some((s) => s.value === activeSubject)) {
    visibleSubjects.push({ value: activeSubject });
  }

  return (
    <div className={styles.filters}>
      {types.length > 0 && (
        <div className={styles.tabs} role="tablist" aria-label="Resource type">
          {[{ key: '', label: 'All' }, ...types].map((t) => (
            <button
              key={t.key || 'all'}
              type="button"
              role="tab"
              aria-selected={activeType === t.key}
              className={`${styles.tab} ${activeType === t.key ? styles.tabActive : ''}`}
              onClick={() => onTypeChange(t.key)}
            >
              {t.label}
              {t.count ? <span className={styles.count}>{t.count.toLocaleString()}</span> : null}
            </button>
          ))}
        </div>
      )}

      {visibleSubjects.length > 0 && (
        <div className={styles.chips} aria-label="Subject">
          <button
            type="button"
            className={`${styles.chip} ${!activeSubject ? styles.chipActive : ''}`}
            onClick={() => onSubjectChange('')}
          >
            All subjects
          </button>
          {visibleSubjects.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`${styles.chip} ${activeSubject === s.value ? styles.chipActive : ''}`}
              onClick={() => onSubjectChange(activeSubject === s.value ? '' : s.value)}
            >
              {s.value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DikshaFilters;
