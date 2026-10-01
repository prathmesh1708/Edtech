import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Library } from 'lucide-react';
import { ROUTES, generateRoute } from '../../../../config/routes';
import { useAuth } from '../../../../models/context/AuthContext';
import useDikshaController from '../../../../controllers/useDikshaController';
import DikshaResourceGrid from '../DikshaResourceGrid/DikshaResourceGrid';
import styles from './DikshaFeaturedSection.module.css';

/**
 * DikshaFeaturedSection — up to 8 DIKSHA resources for a board / class (app values).
 * board / grade undefined = all boards / all classes.
 */
const DikshaFeaturedSection = ({ board, grade }) => {
  const { isAuthenticated } = useAuth();
  const { items, loading, error, retry, available } = useDikshaController({ board, grade, limit: 8 });

  const getLink = (item) =>
    isAuthenticated ? generateRoute(ROUTES.STUDY_MATERIAL_DETAIL, { contentId: item.id }) : ROUTES.LOGIN;

  return (
    <section className={styles.section} aria-labelledby="diksha-featured-title">
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <div className={styles.icon}>
            <Library size={20} />
          </div>
          <div>
            <h2 id="diksha-featured-title" className={styles.title}>Free resources from DIKSHA</h2>
            <p className={styles.subtitle}>
              Openly licensed textbooks, videos and practice material from the Government of India's DIKSHA platform.
            </p>
          </div>
        </div>
        {available && (
          <Link to={isAuthenticated ? ROUTES.STUDY_MATERIALS : ROUTES.LOGIN} className={styles.viewAll}>
            View all <ArrowRight size={15} />
          </Link>
        )}
      </div>

      <DikshaResourceGrid
        items={items}
        loading={loading}
        error={error}
        onRetry={retry}
        available={available}
        unavailableText="Not available on DIKSHA for this board."
        getLink={getLink}
      />
    </section>
  );
};

export default DikshaFeaturedSection;
