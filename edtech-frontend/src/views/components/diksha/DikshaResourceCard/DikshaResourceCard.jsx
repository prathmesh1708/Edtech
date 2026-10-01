import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Badge from '../../common/Badge/Badge';
import DikshaAttribution from '../DikshaAttribution/DikshaAttribution';
import { getDikshaTypeIcon } from '../dikshaTypeIcon';
import styles from './DikshaResourceCard.module.css';

/**
 * DikshaResourceCard — one DIKSHA item (normalized shape from /api/diksha/*).
 * @param {object} item
 * @param {string} to  internal route for the card link
 */
const DikshaResourceCard = ({ item, to }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const Icon = getDikshaTypeIcon(item);
  const meta = [item.subject?.join(', '), item.grade?.join(', ')].filter(Boolean).join(' • ');

  return (
    <Link to={to} className={styles.card}>
      <div className={styles.thumb}>
        {item.thumbnail && !imgFailed ? (
          <img
            src={item.thumbnail}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <Icon size={32} />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.badges}>
          {item.type && <Badge variant="primary" size="sm">{item.type}</Badge>}
          {item.medium?.[0] && <Badge variant="neutral" size="sm">{item.medium[0]}</Badge>}
        </div>
        <h3 className={styles.title} title={item.name || ''}>{item.name || 'Untitled resource'}</h3>
        {meta && <p className={styles.meta}>{meta}</p>}
      </div>

      <div className={styles.footer}>
        <DikshaAttribution attribution={item.attribution} license={item.license} compact />
        <ArrowRight size={16} className={styles.arrow} />
      </div>
    </Link>
  );
};

export default DikshaResourceCard;
