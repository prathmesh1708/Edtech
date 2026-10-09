import React, { useEffect, useRef, useState } from 'react';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Eye, EyeOff } from 'lucide-react';
import api from '../../../../../src/models/services/api';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import PolicyDocument from '../../../../../src/views/components/policy/PolicyDocument';
import { ROUTES } from '../../../../../src/config/routes';
import settings from './SystemSettings.module.css';
import styles from './PolicyManagement.module.css';

const toDateInput = (value) => {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const PolicyManagement = () => {
  const toast = useToast();
  const [policy, setPolicy] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const keyCounter = useRef(0);

  // Local `key` identifies clauses while editing; existing ones reuse their server _id.
  const withKeys = (clauses) =>
    (clauses || []).map((c) => ({ ...c, key: c._id || `new-${keyCounter.current++}` }));

  const load = () => {
    setLoadError('');
    api
      .get('/policies/admin/customer')
      .then((res) =>
        setPolicy({
          ...res.data,
          effectiveDate: toDateInput(res.data.effectiveDate),
          clauses: withKeys(res.data.clauses),
        })
      )
      .catch(() => setLoadError('Could not load the privacy policy settings.'));
  };

  useEffect(load, []);

  const setField = (name, value) => setPolicy((p) => ({ ...p, [name]: value }));
  const setClause = (key, patch) =>
    setPolicy((p) => ({ ...p, clauses: p.clauses.map((c) => (c.key === key ? { ...c, ...patch } : c)) }));
  const addClause = () =>
    setPolicy((p) => ({
      ...p,
      clauses: [...p.clauses, { key: `new-${keyCounter.current++}`, title: '', content: '', enabled: true }],
    }));
  const removeClause = (key) => {
    if (!window.confirm('Delete this clause?')) return;
    setPolicy((p) => ({ ...p, clauses: p.clauses.filter((c) => c.key !== key) }));
  };
  const moveClause = (index, delta) =>
    setPolicy((p) => {
      const next = [...p.clauses];
      const target = index + delta;
      if (target < 0 || target >= next.length) return p;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...p, clauses: next };
    });

  const handleSave = async () => {
    if (policy.clauses.some((c) => !c.title.trim())) {
      toast.error('Every clause needs a title before saving.', 'Missing Title');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/policies/admin/customer', {
        title: policy.title,
        introduction: policy.introduction,
        effectiveDate: policy.effectiveDate,
        contactEmail: policy.contactEmail,
        published: policy.published,
        clauses: policy.clauses.map(({ _id, title, content, enabled }) => ({ _id, title, content, enabled })),
      });
      setPolicy({ ...data, effectiveDate: toDateInput(data.effectiveDate), clauses: withKeys(data.clauses) });
      toast.success(
        policy.published
          ? 'Privacy policy saved and live in the customer app.'
          : 'Privacy policy saved as a draft. It is hidden from customers.',
        'Policy Saved'
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save the privacy policy.', 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className={settings.card}>
        <p>{loadError}</p>
        <button type="button" className={settings.secondaryButton} onClick={load}>Retry</button>
      </div>
    );
  }
  if (!policy) return <div className={settings.card}>Loading privacy policy…</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.editor}>
        {/* Customer / User Policy Setting */}
        <section className={settings.card}>
          <h2 className={settings.cardTitle}>Customer/User Policy Setting</h2>
          <p className={styles.help}>
            Shown to students and parents in the customer app. Anyone can read it without logging in.
          </p>
          {policy.isDefault && (
            <p className={styles.notice}>
              Showing starter text because nothing has been saved yet. Review it with your legal advisor, then save.
            </p>
          )}

          <div className={settings.switchGroup}>
            <div className={settings.switchText}>
              <span className={settings.switchLabel}>Published</span>
              <span className={settings.switchDesc}>
                {policy.published ? 'Visible to customers at /privacy.' : 'Draft — customers see “not available”.'}
              </span>
            </div>
            <label className={settings.switch}>
              <input
                type="checkbox"
                checked={policy.published}
                onChange={(e) => setField('published', e.target.checked)}
              />
              <span className={settings.slider}></span>
            </label>
          </div>

          <div className={settings.formGroup}>
            <label className={settings.formLabel}>Policy Title</label>
            <input
              className={settings.formInput}
              value={policy.title}
              maxLength={200}
              onChange={(e) => setField('title', e.target.value)}
            />
          </div>

          <div className={styles.twoCol}>
            <div className={settings.formGroup}>
              <label className={settings.formLabel}>Effective Date</label>
              <input
                type="date"
                className={settings.formInput}
                value={policy.effectiveDate}
                onChange={(e) => setField('effectiveDate', e.target.value)}
              />
            </div>
            <div className={settings.formGroup}>
              <label className={settings.formLabel}>Contact Email</label>
              <input
                type="email"
                className={settings.formInput}
                placeholder="privacy@yourdomain.com"
                value={policy.contactEmail}
                onChange={(e) => setField('contactEmail', e.target.value)}
              />
            </div>
          </div>

          <div className={settings.formGroup}>
            <label className={settings.formLabel}>Introduction</label>
            <textarea
              className={`${settings.formInput} ${styles.textarea}`}
              rows={4}
              maxLength={5000}
              value={policy.introduction}
              onChange={(e) => setField('introduction', e.target.value)}
            />
          </div>
        </section>

        {/* Policy Clauses & Sections */}
        <section className={settings.card}>
          <h2 className={settings.cardTitle}>Policy Clauses &amp; Sections</h2>
          <p className={styles.help}>
            Sections are numbered in the order shown. Turn one off to hide it without deleting it.
          </p>

          {policy.clauses.length === 0 && <p className={styles.help}>No clauses yet. Add the first one below.</p>}

          {policy.clauses.map((clause, index) => (
            <div key={clause.key} className={`${styles.clause} ${clause.enabled ? '' : styles.clauseOff}`}>
              <div className={styles.clauseHead}>
                <span className={styles.clauseNum}>{index + 1}</span>
                <input
                  className={settings.formInput}
                  placeholder="Clause title"
                  value={clause.title}
                  maxLength={200}
                  onChange={(e) => setClause(clause.key, { title: e.target.value })}
                />
                <div className={styles.clauseTools}>
                  <button type="button" className={styles.iconBtn} title={clause.enabled ? 'Hide clause' : 'Show clause'}
                    onClick={() => setClause(clause.key, { enabled: !clause.enabled })}>
                    {clause.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button type="button" className={styles.iconBtn} title="Move up" disabled={index === 0}
                    onClick={() => moveClause(index, -1)}><ArrowUp size={16} /></button>
                  <button type="button" className={styles.iconBtn} title="Move down" disabled={index === policy.clauses.length - 1}
                    onClick={() => moveClause(index, 1)}><ArrowDown size={16} /></button>
                  <button type="button" className={`${styles.iconBtn} ${styles.danger}`} title="Delete clause"
                    onClick={() => removeClause(clause.key)}><Trash2 size={16} /></button>
                </div>
              </div>
              <textarea
                className={`${settings.formInput} ${styles.textarea}`}
                rows={4}
                maxLength={20000}
                placeholder="Clause text. Press Enter for a new paragraph."
                value={clause.content}
                onChange={(e) => setClause(clause.key, { content: e.target.value })}
              />
            </div>
          ))}

          <button type="button" className={settings.secondaryButton} onClick={addClause}>
            <Plus size={16} /> <span>Add Clause</span>
          </button>
        </section>

        <div className={settings.actionsRow}>
          <button type="button" className={settings.primaryButton} onClick={handleSave} disabled={saving}>
            <Save size={16} /> <span>{saving ? 'Saving…' : 'Save Privacy Policy'}</span>
          </button>
          <a className={styles.link} href={ROUTES.PRIVACY_POLICY} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} /> View public page
          </a>
        </div>
      </div>

      {/* Live preview of the unsaved draft */}
      <aside className={`${settings.card} ${styles.preview}`}>
        <h2 className={settings.cardTitle}>Preview</h2>
        <p className={styles.help}>Exactly what customers will read. Updates as you type.</p>
        <div className={styles.previewBody}>
          <PolicyDocument policy={policy} compact />
        </div>
      </aside>
    </div>
  );
};

export default PolicyManagement;
