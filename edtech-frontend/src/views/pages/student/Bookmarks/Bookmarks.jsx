import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, History, Bookmark, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { ROUTES, generateRoute } from '../../../../config/routes';
import { useDikshaBookmarks, useDikshaRecent, getDikshaErrorMessage } from '../../../../controllers/useDikshaController';
import { useToast } from '../../../components/common/Toast/Toast';
import Button from '../../../components/common/Button/Button';
import Loader from '../../../components/common/Loader/Loader';
import DikshaResourceCard from '../../../components/diksha/DikshaResourceCard/DikshaResourceCard';
import styles from './Bookmarks.module.css';

const detailLink = (contentId) => generateRoute(ROUTES.STUDY_MATERIAL_DETAIL, { contentId });

// Stored bookmark metadata -> the normalized item shape the card renders.
const toCardItem = (b) => ({
  id: b.contentId,
  name: b.title,
  type: b.type,
  mimeType: b.mimeType,
  thumbnail: b.thumbnail,
  subject: b.subject ? [b.subject] : null,
  grade: b.grade ? [b.grade] : null,
  medium: null,
  license: b.license,
  attribution: b.attribution,
  isCollection: b.mimeType === 'application/vnd.ekstep.content-collection',
});

const Bookmarks = () => {
  const toast = useToast();
  const { bookmarks, loading, error, pending, toggle, reload } = useDikshaBookmarks();
  const { recent, loading: recentLoading } = useDikshaRecent();

  const handleRemove = async (contentId) => {
    try {
      await toggle(contentId);
      toast.success('Removed from bookmarks');
    } catch (err) {
      toast.error(getDikshaErrorMessage(err));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Bookmarks</h1>
        <p className={styles.headerSubtitle}>DIKSHA resources you saved, and what you opened recently.</p>
      </header>

      <section className={styles.section} aria-labelledby="recent-title">
        <h2 id="recent-title" className={styles.sectionTitle}>
          <History size={18} /> Recently viewed
        </h2>
        {recentLoading ? (
          <Loader text="" />
        ) : recent.length === 0 ? (
          <p className={styles.muted}>Resources you open in Study Materials will show up here.</p>
        ) : (
          <div className={styles.recentStrip}>
            {recent.map((r) => (
              <Link key={r.contentId} to={detailLink(r.contentId)} className={styles.recentItem} title={r.title || ''}>
                <span className={styles.recentName}>{r.title || 'Untitled resource'}</span>
                <span className={styles.recentMeta}>{r.type || 'DIKSHA'} · Source: DIKSHA</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="saved-title">
        <h2 id="saved-title" className={styles.sectionTitle}>
          <Bookmark size={18} /> Saved resources
          {bookmarks.length > 0 && <span className={styles.count}>{bookmarks.length}</span>}
        </h2>

        {loading ? (
          <Loader text="Loading bookmarks..." />
        ) : error ? (
          <div className={styles.state} role="alert">
            <AlertTriangle size={28} />
            <p>{error}</p>
            <Button variant="outline" size="sm" iconLeft={<RefreshCw size={14} />} onClick={reload}>
              Try again
            </Button>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className={styles.state}>
            <Bookmark size={28} />
            <p>No bookmarks yet. Save textbooks, videos and PDFs from Study Materials.</p>
            <Link to={ROUTES.STUDY_MATERIALS} className={styles.browseLink}>
              Browse Study Materials <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {bookmarks.map((b) => (
              <div key={b.contentId} className={styles.cardWrap}>
                <DikshaResourceCard item={toCardItem(b)} to={detailLink(b.contentId)} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => handleRemove(b.contentId)}
                  disabled={pending === b.contentId}
                  aria-label={`Remove ${b.title || 'resource'} from bookmarks`}
                  title="Remove bookmark"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Bookmarks;
