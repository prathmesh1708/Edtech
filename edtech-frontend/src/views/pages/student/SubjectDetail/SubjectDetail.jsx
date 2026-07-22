import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
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
  chapterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)'
  },
  chapterCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  progressBar: {
    width: '120px',
    height: '6px',
    background: 'var(--color-border)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  }
};

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const {
    subjects,
    currentSubject,
    chapters,
    fetchChapters,
    loading,
    selectedBoard,
    selectedClass
  } = useSyllabusController();

  useEffect(() => {
    if (subjectId) {
      fetchChapters(subjectId);
    }
  }, [subjectId, fetchChapters]);

  const activeSubject = currentSubject || subjects.find(s => s.id === subjectId) || {
    name: 'Subject',
    color: '#4F6EF7',
    description: ''
  };

  const selectedBoardObj = BOARDS.find(b => b.id === selectedBoard) || { name: selectedBoard?.toUpperCase() };
  const selectedClassObj = CLASSES.find(c => String(c.id) === selectedClass) || { name: `Class ${selectedClass}` };

  const handleChapterClick = (chapterId) => {
    navigate(generateRoute(ROUTES.CHAPTER_VIEW, { chapterId }), {
      state: { subjectId, chapterId, subjectName: activeSubject.name }
    });
  };

  return (
    <div>
      <Link to={ROUTES.MY_SYLLABUS} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Syllabus
      </Link>

      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-xl)', background: `${activeSubject.color || '#4F6EF7'}14`, color: activeSubject.color || '#4F6EF7', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{activeSubject.name}</h2>
              {activeSubject.code && <Badge variant="neutral">{activeSubject.code}</Badge>}
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: '2px' }}>
              {selectedClassObj.name} • {selectedBoardObj.name} Syllabus
            </p>
            {activeSubject.description && (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)', marginTop: '4px' }}>
                {activeSubject.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Chapters</h3>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
          {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading chapters...
        </div>
      ) : chapters.length > 0 ? (
        <div style={s.chapterList}>
          {chapters.map((ch, idx) => (
            <div
              key={ch.id || idx}
              style={s.chapterCard}
              className="subject-card-hover"
              onClick={() => handleChapterClick(ch.id || idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {idx + 1}
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', marginBottom: '2px' }}>{ch.title}</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{ch.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Progress: {ch.progress || 0}%</span>
                  <div style={s.progressBar}>
                    <div style={{ width: `${ch.progress || 0}%`, height: '100%', background: ch.progress === 100 ? 'var(--color-success)' : 'var(--color-accent)' }} />
                  </div>
                </div>
                <ChevronRight size={18} color="var(--color-text-tertiary)" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
          <AlertCircle size={32} color="var(--color-text-tertiary)" style={{ marginBottom: '8px' }} />
          <h4 style={{ fontWeight: '600' }}>No Chapters Available Yet</h4>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Chapters can be added dynamically by an Admin in the Admin Panel.</p>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
