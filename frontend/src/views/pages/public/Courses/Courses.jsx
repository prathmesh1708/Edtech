import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { SUBJECTS, BOARDS, CLASSES } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';

const s = {
  page: { paddingTop: 'var(--space-12)' },
  hero: { padding: 'var(--space-12) 0 var(--space-8)', background: 'var(--gradient-surface)' },
  container: { maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' },
  title: { fontSize: 'var(--text-4xl)', fontWeight: '800', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)' },
  subtitle: { fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', maxWidth: '600px', lineHeight: '1.6' },
  filters: { display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', padding: 'var(--space-6) 0' },
  filterBtn: { padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 'var(--text-sm)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' },
  filterActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  grid: { padding: 'var(--space-4) 0 var(--space-20)' },
  card: { background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', transition: 'all 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  icon: { width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 'var(--text-lg)', fontWeight: '600', fontFamily: 'var(--font-heading)' },
  cardMeta: { display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)' },
};

const Courses = () => {
  const [activeBoard, setActiveBoard] = useState('all');
  const [activeClass, setActiveClass] = useState('all');
  const gridRef = useScrollAnimation('stagger');

  const filteredSubjects = SUBJECTS; // In real app, filter based on board/class

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.container}>
          <h1 style={s.title}>Explore <span className="text-gradient">Courses & Subjects</span></h1>
          <p style={s.subtitle}>Browse our comprehensive collection of subjects across all major boards and classes.</p>
        </div>
      </section>

      <div style={s.container}>
        <div style={s.filters}>
          <button style={{ ...s.filterBtn, ...(activeBoard === 'all' ? s.filterActive : {}) }} onClick={() => setActiveBoard('all')}>All Boards</button>
          {BOARDS.map((b) => (
            <button key={b.id} style={{ ...s.filterBtn, ...(activeBoard === b.id ? s.filterActive : {}) }} onClick={() => setActiveBoard(b.id)}>{b.name}</button>
          ))}
        </div>

        <div style={s.grid} className="responsive-grid-3" ref={gridRef}>
          {filteredSubjects.map((subject) => {
            const Icon = Icons[subject.icon] || Icons.BookOpen;
            return (
              <Link key={subject.id} to={generateRoute(ROUTES.COURSE_DETAIL, { courseId: subject.id })} style={{ textDecoration: 'none' }}>
                <div style={s.card}>
                  <div style={s.cardTop}>
                    <div style={{ ...s.icon, background: `${subject.color}14`, color: subject.color }}>
                      <Icon size={22} />
                    </div>
                    <Badge variant="primary" size="sm">Popular</Badge>
                  </div>
                  <h3 style={s.cardTitle}>{subject.name}</h3>
                  <div style={s.cardMeta}>
                    <span>12 Classes</span>
                    <span>•</span>
                    <span>50+ Chapters</span>
                  </div>
                  <div style={s.cardFooter}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: '600' }}>Explore Subject</span>
                    <ArrowRight size={16} color="var(--color-accent)" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Courses;
