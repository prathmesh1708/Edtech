import React from 'react';
import { AlertTriangle, SearchX, RefreshCw, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import Loader from '../../common/Loader/Loader';
import Button from '../../common/Button/Button';
import DikshaResourceCard from '../DikshaResourceCard/DikshaResourceCard';
import styles from './DikshaResourceGrid.module.css';

const MAX_PAGE = 100; // backend accepts page 1–100

/**
 * DikshaResourceGrid — grid of DIKSHA cards with loading / empty / error / unavailable states.
 */
const DikshaResourceGrid = ({
  items = [],
  loading = false,
  error = null,
  onRetry,
  available = true,
  unavailableText = 'Not available on DIKSHA for this board.',
  emptyText = 'No DIKSHA resources match these filters.',
  pagination,
  onPageChange,
  getLink,
}) => {
  if (loading) {
    return <Loader text="Loading DIKSHA resources..." />;
  }

  if (error) {
    return (
      <div className={`${styles.state} ${styles.error}`} role="alert">
        <AlertTriangle size={28} />
        <p>{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" iconLeft={<RefreshCw size={14} />} onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!available) {
    return (
      <div className={styles.state}>
        <Info size={28} />
        <p>{unavailableText}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.state}>
        <SearchX size={28} />
        <p>{emptyText}</p>
      </div>
    );
  }

  const totalPages = pagination ? Math.min(MAX_PAGE, Math.ceil(pagination.total / pagination.limit)) : 1;

  return (
    <>
      <div className={styles.grid}>
        {items.map((item) => (
          <DikshaResourceCard key={item.id} item={item} to={getLink(item)} />
        ))}
      </div>

      {onPageChange && totalPages > 1 && (
        <nav className={styles.pagination} aria-label="DIKSHA results pages">
          <Button
            variant="outline"
            size="sm"
            iconLeft={<ChevronLeft size={14} />}
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className={styles.pageInfo}>
            Page {pagination.page} of {totalPages} · {pagination.total.toLocaleString()} results
          </span>
          <Button
            variant="outline"
            size="sm"
            iconRight={<ChevronRight size={14} />}
            disabled={pagination.page >= totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </>
  );
};

export default DikshaResourceGrid;
