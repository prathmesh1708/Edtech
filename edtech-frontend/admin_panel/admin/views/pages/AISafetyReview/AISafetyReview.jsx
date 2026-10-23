import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldAlert, ArrowLeft, Bot, User, CheckCircle2, XCircle, RotateCcw, Loader2, Info } from 'lucide-react';
import aiAdminService from '../../../../../src/models/services/aiAdminService';
import MarkdownMessage from '../../../../../src/views/pages/student/AIChat/components/MarkdownMessage';
import styles from './AISafetyReview.module.css';

const TABS = [
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'dismissed', label: 'Dismissed' },
  { id: 'all', label: 'All' },
];

const REASONS = {
  self_harm: { label: 'Self-harm', help: 'The student wrote something suggesting they may want to hurt themselves.' },
  abuse: { label: 'Abuse', help: 'The student wrote something suggesting they may be hurt or abused by someone.' },
  blocked: { label: 'Safety block', help: "The AI's safety filter blocked a request or answer. Usually low risk; check for patterns." },
};

const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

const classText = (student) => {
  if (!student) return 'Unknown student';
  const cls = student.classId ? (/^\d+$/.test(student.classId) ? `Class ${student.classId}` : student.classId) : '';
  return [cls, student.board?.toUpperCase()].filter(Boolean).join(' · ');
};

const AISafetyReview = () => {
  const [tab, setTab] = useState('open');
  const [flags, setFlags] = useState([]);
  const [counts, setCounts] = useState({ open: 0, urgentOpen: 0 });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const transcriptRef = useRef(null);

  // Bring the flagged message into view inside the transcript (not the whole page).
  useEffect(() => {
    const box = transcriptRef.current;
    const flagged = box?.querySelector('[data-flagged="true"]');
    if (box && flagged) box.scrollTop = flagged.offsetTop - 24; // .transcript is the offset parent
  }, [detail]);

  const loadFlags = useCallback(async (status, nextPage = 1) => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await aiAdminService.getFlags({ status, page: nextPage, limit: 20 });
      setFlags((prev) => (nextPage === 1 ? res.data.flags : [...prev, ...res.data.flags]));
      setCounts(res.data.counts);
      setTotal(res.data.total);
      setPage(nextPage);
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not load flags.');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlags(tab);
    setSelectedId(null);
    setDetail(null);
  }, [tab, loadFlags]);

  const openFlag = async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const res = await aiAdminService.getFlag(id);
      setDetail(res.data);
      setNote(res.data.flag.note || '');
    } catch (err) {
      setDetail({ error: err.response?.data?.message || 'Could not load this flag.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const review = async (status) => {
    if (!detail?.flag) return;
    setSaving(true);
    try {
      const res = await aiAdminService.updateFlag(detail.flag.id, { status, note });
      const updated = res.data.flag;
      setDetail((d) => ({ ...d, flag: updated }));
      setFlags((prev) =>
        tab === 'all' || tab === updated.status ? prev.map((f) => (f.id === updated.id ? updated : f)) : prev.filter((f) => f.id !== updated.id)
      );
      const refreshed = await aiAdminService.getFlags({ status: 'open', limit: 1 });
      setCounts(refreshed.data.counts);
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not save the review.');
    } finally {
      setSaving(false);
    }
  };

  const flag = detail?.flag;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}><ShieldAlert size={24} /> AI Safety Review</h1>
          <p className={styles.subtitle}>
            Student AI conversations flagged for a safeguarding check. Open a conversation only to act on a concern.
          </p>
        </div>
        <div className={styles.counters}>
          <span className={`${styles.counter} ${counts.urgentOpen ? styles.counterUrgent : ''}`}>{counts.urgentOpen} urgent</span>
          <span className={styles.counter}>{counts.open} open</span>
        </div>
      </header>

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`${styles.layout} ${selectedId ? styles.showDetail : ''}`}>
        <section className={styles.listPane} aria-label="Flags">
          {listError && <p className={styles.error}>{listError}</p>}
          {!listError && !listLoading && flags.length === 0 && (
            <div className={styles.empty}>
              <CheckCircle2 size={28} />
              <p>{tab === 'open' ? 'Nothing to review right now.' : 'No flags here.'}</p>
            </div>
          )}
          <ul className={styles.list}>
            {flags.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className={`${styles.item} ${selectedId === f.id ? styles.itemActive : ''}`}
                  onClick={() => openFlag(f.id)}
                >
                  <span className={styles.itemTop}>
                    <span className={`${styles.badge} ${f.severity === 'urgent' ? styles.badgeUrgent : styles.badgeNormal}`}>
                      {f.severity === 'urgent' ? 'Urgent' : 'Review'}
                    </span>
                    <span className={styles.reason}>{REASONS[f.reason]?.label || f.reason}</span>
                    {f.occurrences > 1 && <span className={styles.occurrences}>×{f.occurrences}</span>}
                    <span className={styles.time}>{formatTime(f.lastSeenAt)}</span>
                  </span>
                  <span className={styles.student}>{f.student?.name || 'Unknown student'} <span>{classText(f.student)}</span></span>
                  <span className={styles.excerpt}>{f.excerpt}</span>
                  {f.status !== 'open' && <span className={styles.statusTag}>{f.status}</span>}
                </button>
              </li>
            ))}
          </ul>
          {listLoading && <p className={styles.loading}><Loader2 size={16} className={styles.spin} /> Loading...</p>}
          {!listLoading && flags.length < total && (
            <button type="button" className={styles.loadMore} onClick={() => loadFlags(tab, page + 1)}>Load more</button>
          )}
        </section>

        <section className={styles.detailPane} aria-label="Flag details">
          {!selectedId && <div className={styles.empty}><Info size={24} /><p>Select a flag to review it.</p></div>}
          {selectedId && detailLoading && <p className={styles.loading}><Loader2 size={16} className={styles.spin} /> Loading...</p>}
          {selectedId && !detailLoading && detail?.error && <p className={styles.error}>{detail.error}</p>}

          {selectedId && !detailLoading && flag && (
            <>
              <button type="button" className={styles.back} onClick={() => setSelectedId(null)}>
                <ArrowLeft size={16} /> All flags
              </button>

              <div className={styles.detailHead}>
                <div>
                  <h2 className={styles.detailTitle}>{flag.student?.name || 'Unknown student'}</h2>
                  <p className={styles.detailMeta}>
                    {classText(flag.student)}
                    {flag.student?.studentId && ` · ID ${flag.student.studentId}`}
                  </p>
                </div>
                <span className={`${styles.badge} ${flag.severity === 'urgent' ? styles.badgeUrgent : styles.badgeNormal}`}>
                  {REASONS[flag.reason]?.label}
                </span>
              </div>

              <p className={styles.help}>{REASONS[flag.reason]?.help}</p>
              {flag.severity === 'urgent' && flag.status === 'open' && (
                <div className={styles.guidance}>
                  <strong>Recommended:</strong> follow your safeguarding procedure today — inform the designated
                  safeguarding lead and the student's parent or guardian. If the child may be in immediate danger,
                  call <strong>112</strong>. Childline India: <strong>1098</strong>.
                </div>
              )}

              <p className={styles.metaLine}>
                First flagged {formatTime(flag.createdAt)} · last seen {formatTime(flag.lastSeenAt)}
                {flag.occurrences > 1 && ` · ${flag.occurrences} times`}
              </p>

              <h3 className={styles.sectionTitle}>Conversation{detail.conversation?.subject && detail.conversation.subject !== 'General' ? ` · ${detail.conversation.subject}` : ''}</h3>
              {!detail.conversation ? (
                <p className={styles.muted}>The student has deleted this conversation. Flagged text: “{flag.excerpt}”</p>
              ) : (
                <div className={styles.transcript} ref={transcriptRef}>
                  {detail.conversation.messages.map((m) => (
                    <div
                      key={m.id}
                      data-flagged={m.flagged ? 'true' : undefined}
                      className={`${styles.msg} ${m.sender === 'ai' ? styles.msgAi : styles.msgUser} ${m.flagged ? styles.msgFlagged : ''}`}
                    >
                      <span className={styles.msgWho}>
                        {m.sender === 'ai' ? <Bot size={13} /> : <User size={13} />}
                        {m.sender === 'ai' ? 'AI tutor' : 'Student'}
                        {m.inputMode !== 'text' && m.sender === 'user' && ` (${m.inputMode})`}
                        {m.status === 'blocked' && ' · blocked'}
                        <span className={styles.msgTime}>{formatTime(m.timestamp)}</span>
                      </span>
                      {m.sender === 'ai' && m.text ? (
                        <div className={styles.msgText}><MarkdownMessage text={m.text} /></div>
                      ) : (
                        <p className={styles.msgText}>{m.text || (m.sender === 'user' ? '[photo / voice only]' : '[no answer]')}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <label className={styles.noteLabel}>
                Review note (who was contacted, what was done)
                <textarea className={styles.note} value={note} maxLength={1000} rows={3} onChange={(e) => setNote(e.target.value)} />
              </label>

              {flag.reviewedBy && (
                <p className={styles.metaLine}>
                  Last reviewed by {flag.reviewedBy} on {formatTime(flag.reviewedAt)} · status: {flag.status}
                </p>
              )}

              <div className={styles.actions}>
                {flag.status === 'open' ? (
                  <>
                    <button type="button" className={styles.primary} disabled={saving} onClick={() => review('resolved')}>
                      <CheckCircle2 size={16} /> Mark resolved
                    </button>
                    <button type="button" className={styles.secondary} disabled={saving} onClick={() => review('dismissed')}>
                      <XCircle size={16} /> Dismiss (false alarm)
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className={styles.secondary} disabled={saving} onClick={() => review(flag.status)}>
                      Save note
                    </button>
                    <button type="button" className={styles.secondary} disabled={saving} onClick={() => review('open')}>
                      <RotateCcw size={16} /> Reopen
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AISafetyReview;
