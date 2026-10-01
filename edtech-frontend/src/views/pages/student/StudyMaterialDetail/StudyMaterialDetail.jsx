import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, AlertTriangle, RefreshCw, Folder, FileText, ChevronRight, Info,
} from 'lucide-react';
import { ROUTES, generateRoute } from '../../../../config/routes';
import { useDikshaItem, useDikshaBookmarks, getDikshaErrorMessage } from '../../../../controllers/useDikshaController';
import dikshaService from '../../../../models/services/dikshaService';
import { useToast } from '../../../components/common/Toast/Toast';
import Badge from '../../../components/common/Badge/Badge';
import Button from '../../../components/common/Button/Button';
import Loader from '../../../components/common/Loader/Loader';
import DikshaAttribution from '../../../components/diksha/DikshaAttribution/DikshaAttribution';
import { getDikshaTypeIcon } from '../../../components/diksha/dikshaTypeIcon';
import styles from './StudyMaterialDetail.module.css';

// Placeholder text DIKSHA creators sometimes leave in the description field.
const isPlaceholder = (text) => !text || /^enter description/i.test(text.trim());

const openLabel = (url) => {
  try {
    const host = new URL(url).hostname;
    return host.includes('youtube') || host === 'youtu.be' ? 'Open on YouTube' : 'Open on DIKSHA';
  } catch {
    return 'Open on DIKSHA';
  }
};

const countLeaves = (node) =>
  node.children?.length ? node.children.reduce((sum, c) => sum + countLeaves(c), 0) : 1;

const ChapterNode = ({ node, depth, defaultOpen }) => {
  const isUnit = node.children?.length > 0;

  if (!isUnit) {
    const isEmptyUnit = node.mimeType === 'application/vnd.ekstep.content-collection';
    return (
      <li className={styles.leaf}>
        <FileText size={14} className={styles.leafIcon} />
        {node.id && !isEmptyUnit ? (
          <Link to={generateRoute(ROUTES.STUDY_MATERIAL_DETAIL, { contentId: node.id })} className={styles.leafLink}>
            {node.name || 'Untitled'}
          </Link>
        ) : (
          <span className={styles.leafName}>{node.name || 'Untitled'}</span>
        )}
        {node.license && <span className={styles.leafLicense}>{node.license}</span>}
        {node.contentUrl && (
          <a
            href={node.contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.leafOpen}
            aria-label={`${openLabel(node.contentUrl)}: ${node.name || ''}`}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </li>
    );
  }

  return (
    <li className={styles.unit}>
      <details open={defaultOpen}>
        <summary className={styles.unitSummary}>
          <ChevronRight size={15} className={styles.chevron} />
          <Folder size={15} className={styles.unitIcon} />
          <span className={styles.unitName}>{node.name || 'Untitled unit'}</span>
          <span className={styles.unitCount}>{countLeaves(node)}</span>
        </summary>
        <ul className={styles.tree}>
          {node.children.map((child, i) => (
            <ChapterNode key={child.id || i} node={child} depth={depth + 1} defaultOpen={false} />
          ))}
        </ul>
      </details>
    </li>
  );
};

const StudyMaterialDetail = () => {
  const { contentId } = useParams();
  const toast = useToast();
  const { item, children, loading, error, retry } = useDikshaItem(contentId);
  const { isBookmarked, toggle, pending } = useDikshaBookmarks();
  const [imgFailed, setImgFailed] = useState(false);
  const recordedFor = useRef(null);

  // Record a view once per opened item (metadata only, server-side).
  useEffect(() => {
    if (!item?.id || recordedFor.current === item.id) return;
    recordedFor.current = item.id;
    dikshaService.addRecent(item.id).catch(() => {});
  }, [item?.id]);

  useEffect(() => setImgFailed(false), [contentId]);

  const handleBookmark = async () => {
    try {
      const added = await toggle(item.id);
      toast.success(added ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) {
      toast.error(getDikshaErrorMessage(err));
    }
  };

  if (loading) return <Loader text="Loading resource from DIKSHA..." />;

  if (error || !item) {
    return (
      <div className={styles.container}>
        <Link to={ROUTES.STUDY_MATERIALS} className={styles.back}>
          <ArrowLeft size={16} /> Study Materials
        </Link>
        <div className={styles.errorBox} role="alert">
          <AlertTriangle size={28} />
          <p>{error || 'This resource could not be loaded.'}</p>
          <Button variant="outline" size="sm" iconLeft={<RefreshCw size={14} />} onClick={retry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const Icon = getDikshaTypeIcon(item);
  const saved = isBookmarked(item.id);
  const facts = [
    ['Board', item.board],
    ['Class', item.grade?.join(', ')],
    ['Subject', item.subject?.join(', ')],
    ['Medium', item.medium?.join(', ')],
    ['Language', item.language?.join(', ')],
  ].filter(([, v]) => v);

  return (
    <div className={styles.container}>
      <Link to={ROUTES.STUDY_MATERIALS} className={styles.back}>
        <ArrowLeft size={16} /> Study Materials
      </Link>

      <article className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.thumb}>
            {item.thumbnail && !imgFailed ? (
              <img src={item.thumbnail} alt="" referrerPolicy="no-referrer" onError={() => setImgFailed(true)} />
            ) : (
              <Icon size={40} />
            )}
          </div>

          <div className={styles.heroBody}>
            <div className={styles.badges}>
              {item.type && <Badge variant="primary" size="sm">{item.type}</Badge>}
              {item.isCollection && <Badge variant="neutral" size="sm">Collection</Badge>}
            </div>
            <h1 className={styles.title}>{item.name || 'Untitled resource'}</h1>
            <DikshaAttribution attribution={item.attribution} license={item.license} />

            <div className={styles.actions}>
              <Button
                variant={saved ? 'secondary' : 'outline'}
                size="sm"
                loading={pending === item.id}
                iconLeft={saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                onClick={handleBookmark}
              >
                {saved ? 'Bookmarked' : 'Bookmark'}
              </Button>
              {item.contentUrl && (
                <a href={item.contentUrl} target="_blank" rel="noopener noreferrer" className={styles.openLink}>
                  {openLabel(item.contentUrl)} <ExternalLink size={14} />
                </a>
              )}
            </div>
            {!item.contentUrl && !item.isCollection && (
              <p className={styles.note}>
                <Info size={14} /> This resource can't be opened directly here. Find it in the DIKSHA app by its name.
              </p>
            )}
          </div>
        </div>

        {facts.length > 0 && (
          <dl className={styles.facts}>
            {facts.map(([label, value]) => (
              <div key={label} className={styles.fact}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {!isPlaceholder(item.description) && item.description !== item.name && (
          <p className={styles.description}>{item.description}</p>
        )}
      </article>

      {item.isCollection && (
        <section className={styles.card} aria-labelledby="chapters-title">
          <h2 id="chapters-title" className={styles.sectionTitle}>Chapters</h2>
          {children === null ? (
            <p className={styles.note}>
              <Info size={14} /> The chapter list couldn't be loaded from DIKSHA right now.
            </p>
          ) : children.length === 0 ? (
            <p className={styles.note}>This collection has no chapters yet.</p>
          ) : (
            <>
              <ul className={`${styles.tree} ${styles.treeRoot}`}>
                {children.map((child, i) => (
                  <ChapterNode key={child.id || i} node={child} depth={0} defaultOpen={i === 0} />
                ))}
              </ul>
              <p className={styles.treeHint}>
                Each item shows its own license. Direct links appear only for CC BY / CC BY-SA files.
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default StudyMaterialDetail;
