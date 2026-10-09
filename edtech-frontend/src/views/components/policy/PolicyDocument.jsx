import React from 'react';
import styles from './PolicyDocument.module.css';

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Renders a policy as plain text (never as HTML), so admin-entered content can't inject markup.
// Shared by the public /privacy page and the admin live preview.
const PolicyDocument = ({ policy, compact = false }) => {
  const clauses = (policy.clauses || []).filter((c) => c.enabled !== false);

  return (
    <article className={`${styles.document} ${compact ? styles.compact : ''}`}>
      <h1 className={styles.title}>{policy.title || 'Privacy Policy'}</h1>
      {policy.effectiveDate && (
        <p className={styles.meta}>Effective {formatDate(policy.effectiveDate)}</p>
      )}
      {policy.introduction && <p className={styles.paragraph}>{policy.introduction}</p>}

      {clauses.map((clause, index) => (
        <section key={clause._id || clause.id || index} className={styles.clause}>
          <h2 className={styles.clauseTitle}>
            {index + 1}. {clause.title || 'Untitled clause'}
          </h2>
          {(clause.content || '')
            .split(/\n{1,}/)
            .filter((line) => line.trim())
            .map((line, i) => (
              <p key={i} className={styles.paragraph}>{line}</p>
            ))}
        </section>
      ))}

      {policy.contactEmail && (
        <section className={styles.clause}>
          <h2 className={styles.clauseTitle}>Contact Us</h2>
          <p className={styles.paragraph}>
            Questions about this policy? Write to{' '}
            <a href={`mailto:${policy.contactEmail}`}>{policy.contactEmail}</a>.
          </p>
        </section>
      )}
    </article>
  );
};

export default PolicyDocument;
