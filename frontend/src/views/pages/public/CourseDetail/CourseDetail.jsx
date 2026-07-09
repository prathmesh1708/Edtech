import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, FileText, Video, ChevronRight } from 'lucide-react';
import { SUBJECTS } from '../../../../config/constants';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

const MOCK_CHAPTERS = [
  { id: 1, title: 'Introduction & Fundamentals', topics: 5, duration: '2 hours', hasVideo: true, hasNotes: true },
  { id: 2, title: 'Core Concepts', topics: 8, duration: '3 hours', hasVideo: true, hasNotes: true },
  { id: 3, title: 'Advanced Applications', topics: 6, duration: '2.5 hours', hasVideo: true, hasNotes: true },
  { id: 4, title: 'Problem Solving & Practice', topics: 10, duration: '4 hours', hasVideo: false, hasNotes: true },
  { id: 5, title: 'Revision & Summary', topics: 4, duration: '1.5 hours', hasVideo: true, hasNotes: true },
];

const s = {
  page: { paddingTop: 'var(--space-12)' },
  back: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4) 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', fontWeight: '500', cursor: 'pointer', maxWidth: 'var(--max-width)', margin: '0 auto', paddingLeft: 'var(--space-6)', paddingRight: 'var(--space-6)' },
  hero: { background: 'var(--gradient-surface)', padding: 'var(--space-8) 0 var(--space-12)' },
  container: { maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' },
  heroGrid: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-8)', alignItems: 'center' },
  title: { fontSize: 'var(--text-4xl)', fontWeight: '800', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)' },
  meta: { display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' },
  metaItem: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' },
  desc: { fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', lineHeight: '1.6', maxWidth: '600px' },
  chaptersSection: { padding: 'var(--space-12) 0 var(--space-20)' },
  sectionTitle: { fontSize: 'var(--text-2xl)', fontWeight: '700', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' },
  chapter: { background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5) var(--space-6)', border: '1px solid var(--color-border-light)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' },
  chapterLeft: { display: 'flex', alignItems: 'center', gap: 'var(--space-4)' },
  chapterNum: { width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--color-primary)', fontSize: 'var(--text-sm)' },
  chapterInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  chapterTitle: { fontWeight: '600', fontSize: 'var(--text-base)' },
  chapterMeta: { display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' },
  chapterRight: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' },
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const subject = SUBJECTS.find((s) => s.id === courseId) || { name: 'Subject', color: '#4F6EF7' };

  return (
    <div style={s.page}>
      <Link to="/courses" style={{ ...s.back, textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      <section style={s.hero}>
        <div style={s.container}>
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <Badge variant="primary">CBSE</Badge>
              <Badge variant="neutral">Class 1–12</Badge>
            </div>
            <h1 style={s.title}>{subject.name}</h1>
            <div style={s.meta}>
              <span style={s.metaItem}><BookOpen size={16} /> 5 Chapters</span>
              <span style={s.metaItem}><Clock size={16} /> 13 Hours</span>
              <span style={s.metaItem}><FileText size={16} /> Notes & PDFs</span>
              <span style={s.metaItem}><Video size={16} /> Video Lessons</span>
            </div>
            <p style={s.desc}>
              Comprehensive {subject.name} course covering all chapters aligned with board syllabus. Includes notes, video explanations, and AI-powered doubt solving.
            </p>
          </div>
        </div>
      </section>

      <section style={s.chaptersSection}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Chapters</h2>
          {MOCK_CHAPTERS.map((ch) => (
            <div key={ch.id} style={s.chapter}>
              <div style={s.chapterLeft}>
                <div style={s.chapterNum}>{ch.id}</div>
                <div style={s.chapterInfo}>
                  <span style={s.chapterTitle}>{ch.title}</span>
                  <div style={s.chapterMeta}>
                    <span>{ch.topics} Topics</span>
                    <span>•</span>
                    <span>{ch.duration}</span>
                  </div>
                </div>
              </div>
              <div style={s.chapterRight}>
                {ch.hasVideo && <Badge variant="primary" size="sm">Video</Badge>}
                {ch.hasNotes && <Badge variant="success" size="sm">Notes</Badge>}
                <ChevronRight size={18} color="var(--color-text-tertiary)" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
