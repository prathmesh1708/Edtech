import React from 'react';
import { Scale } from 'lucide-react';
import styles from './DikshaAttribution.module.css';

/**
 * DikshaAttribution — "Source: DIKSHA", creator / organisation and license.
 * Required on every DIKSHA card and detail page (CC licenses require attribution).
 */
const DikshaAttribution = ({ attribution, license, compact = false, className = '' }) => {
  const by = [attribution?.creator, attribution?.organisation].filter(Boolean);
  const uniqueBy = by.filter((v, i) => by.indexOf(v) === i);

  return (
    <div className={`${styles.attribution} ${compact ? styles.compact : ''} ${className}`}>
      <span className={styles.source}>Source: DIKSHA</span>
      {uniqueBy.length > 0 && <span className={styles.by} title={uniqueBy.join(' · ')}>by {uniqueBy.join(' · ')}</span>}
      <span className={styles.license}>
        <Scale size={11} />
        {license || 'License not specified'}
      </span>
    </div>
  );
};

export default DikshaAttribution;
