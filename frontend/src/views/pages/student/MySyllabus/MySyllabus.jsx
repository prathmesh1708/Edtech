import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Award } from 'lucide-react';
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
  }
};

const MySyllabus = () => {
  const {
    selectedBoard,
    selectedClass,
    subjects,
    selectBoard,
    selectClass
  } = useSyllabusController();
  const navigate = useNavigate();

  const handleSubjectClick = (subjectId) => {
    navigate(generateRoute(ROUTES.SUBJECT_DETAIL, { subjectId }));
  };

  return (
    <div>
      <div style={s.header}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Syllabus Finder</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Browse topics & chapters customized to your current academic standard.
        </p>

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

      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>Subjects</h3>

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
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>10 Chapters</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--color-text-tertiary)" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MySyllabus;
