import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { BOARDS, CLASSES } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import useSyllabusController from '../../../../controllers/useSyllabusController';
import Badge from '../../../components/common/Badge/Badge';

const s = {
  header: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border-light)',
    marginBottom: 'var(--space-8)'
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-4)',
    alignItems: 'center',
    marginTop: 'var(--space-4)'
  },
  select: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-border)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    fontWeight: '600',
    outline: 'none',
    background: 'var(--color-surface)'
  },
  grid: {
    width: '100%'
  },
  card: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-card)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    border: '1px dashed var(--color-border)',
    marginTop: 'var(--space-4)'
  }
};

const MySyllabus = () => {
  const {
    selectedBoard,
    selectedClass,
    subjects,
    loading,
    selectBoard,
    selectClass,
    refreshSubjects
  } = useSyllabusController();
  const navigate = useNavigate();

  const handleSubjectClick = (subjectId) => {
    navigate(generateRoute(ROUTES.SUBJECT_DETAIL, { subjectId }));
  };

  const selectedBoardObj = BOARDS.find(b => b.id === selectedBoard) || { name: selectedBoard?.toUpperCase() };
  const selectedClassObj = CLASSES.find(c => String(c.id) === selectedClass) || { name: `Class ${selectedClass}` };

  return (
    <div>
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Syllabus Finder</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Browse topics & chapters customized to your current academic standard.
            </p>
          </div>
          <button
            onClick={refreshSubjects}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div style={s.filterRow}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: '700' }}>Board</span>
            <select
              style={s.select}
              value={selectedBoard}
              onChange={(e) => selectBoard(e.target.value)}
            >
              {BOARDS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: '700' }}>Class</span>
            <select
              style={s.select}
              value={selectedClass}
              onChange={(e) => selectClass(e.target.value)}
            >
              {CLASSES.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
          Subjects ({selectedBoardObj.name} - {selectedClassObj.name})
        </h3>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
          {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'} available
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading dynamic syllabus from backend...
        </div>
      ) : subjects.length > 0 ? (
        <div style={s.grid} className="responsive-grid-3">
          {subjects.map((subj) => (
            <div
              key={subj.id}
              style={s.card}
              className="subject-card-hover"
              onClick={() => handleSubjectClick(subj.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: `${subj.color}14`, color: subj.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '2px', color: 'var(--color-text-primary)' }}>{subj.name}</h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    {subj.chapterCount} {subj.chapterCount === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-tertiary)" />
            </div>
          ))}
        </div>
      ) : (
        <div style={s.emptyState}>
          <AlertCircle size={36} color="var(--color-text-tertiary)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>No Subjects Added Yet</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            There are no active subjects registered for {selectedBoardObj.name} {selectedClassObj.name} in the backend yet. An Admin can add new subjects dynamically from the Admin Panel.
          </p>
        </div>
      )}
    </div>
  );
};

export default MySyllabus;
