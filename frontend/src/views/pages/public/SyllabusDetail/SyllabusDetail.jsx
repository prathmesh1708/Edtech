import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { BOARDS, CLASSES, SUBJECTS } from '../../../../config/constants';
import Badge from '../../../components/common/Badge/Badge';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';

const SyllabusDetail = () => {
  const { boardId, classId } = useParams();
  const board = BOARDS.find((b) => b.id === boardId) || { name: 'Board', fullName: '' };
  const cls = CLASSES.find((c) => c.id === parseInt(classId)) || { name: 'Class', label: '' };
  const gridRef = useScrollAnimation('stagger');

  return (
    <div style={{ paddingTop: 'var(--space-12)' }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' }}>
        <Link to="/syllabus" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4) 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Syllabus
        </Link>
      </div>

      <section style={{ padding: 'var(--space-8) 0', background: 'var(--gradient-surface)' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Badge variant="primary">{board.name}</Badge>
            <Badge variant="neutral">{cls.name}</Badge>
          </div>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-3)' }}>
            {board.name} Syllabus — {cls.name}
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>
            Complete subject-wise syllabus for {board.fullName} {cls.name}.
          </p>
        </div>
      </section>

      <section style={{ padding: 'var(--space-12) 0 var(--space-20)' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' }}>Subjects</h2>
          <div className="responsive-grid-3" style={{ gap: 'var(--space-4)' }} ref={gridRef}>
            {SUBJECTS.slice(0, parseInt(classId) > 10 ? 10 : 5).map((subj) => {
              const Icon = Icons[subj.icon] || BookOpen;
              return (
                <div key={subj.id} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: `${subj.color}14`, color: subj.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', marginBottom: '2px' }}>{subj.name}</h3>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>10 Chapters</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--color-text-tertiary)" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SyllabusDetail;
