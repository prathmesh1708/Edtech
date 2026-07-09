import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SUBJECTS } from '../../../../config/constants';
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
  const { chapters, fetchChapters } = useSyllabusController();
  const subject = SUBJECTS.find(s => s.id === subjectId) || { name: 'Subject', color: '#4F6EF7' };

  useEffect(() => {
    fetchChapters(subjectId);
  }, [subjectId, fetchChapters]);

  const handleChapterClick = (chapterId) => {
    navigate(generateRoute(ROUTES.CHAPTER_VIEW, { chapterId }));
  };

  return (
    <div>
      <Link to={ROUTES.MY_SYLLABUS} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Syllabus
      </Link>

      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-xl)', background: `${subject.color}14`, color: subject.color, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{subject.name}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Class 10th • CBSE Syllabus</p>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>Chapters</h3>

      <div style={s.chapterList}>
        {chapters.map((ch, idx) => (
          <div
            key={ch.id}
            style={s.chapterCard}
            className="subject-card-hover"
            onClick={() => handleChapterClick(ch.id)}
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
                <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Progress: {ch.progress}%</span>
                <div style={s.progressBar}>
                  <div style={{ width: `${ch.progress}%`, height: '100%', background: ch.progress === 100 ? 'var(--color-success)' : 'var(--color-accent)' }} />
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-tertiary)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectDetail;
