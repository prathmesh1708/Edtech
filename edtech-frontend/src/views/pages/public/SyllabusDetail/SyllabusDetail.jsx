import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Layers, Sparkles } from 'lucide-react';
import * as Icons from 'lucide-react';
import { resolveBoardInfo, CLASSES, SUBJECTS } from '../../../../config/constants';
import { ROUTES } from '../../../../config/routes';
import syllabusService from '../../../../models/services/syllabusService';
import Badge from '../../../components/common/Badge/Badge';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';

const SyllabusDetail = () => {
  const { boardId, classId } = useParams();
  const navigate = useNavigate();
  const board = resolveBoardInfo(boardId);
  const cls = CLASSES.find((c) => c.id === parseInt(classId)) || { name: `Class ${classId}`, label: `${classId}th` };
  const gridRef = useScrollAnimation('stagger');

  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBoardSubjects = async () => {
      setLoading(true);
      try {
        const res = await syllabusService.getSubjects(boardId, classId);
        let items = [];
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }

        if (items.length > 0) {
          setSubjectsList(items.map((it) => ({
            id: it._id || it.id,
            name: it.subjectName || it.name,
            code: it.subjectCode || it.code,
            description: it.description || '',
            color: it.color || '#4F6EF7',
            icon: it.icon || 'BookOpen',
            chaptersCount: it.chapters ? it.chapters.length : 10
          })));
        } else {
          // Fallback to constants
          setSubjectsList(SUBJECTS.slice(0, parseInt(classId) > 10 ? 10 : 6).map(s => ({
            id: s.id,
            name: s.name,
            code: `${s.name.substring(0, 3).toUpperCase()}-${classId}`,
            description: `Core ${board.name} syllabus for ${s.name}`,
            color: s.color,
            icon: s.icon,
            chaptersCount: 12
          })));
        }
      } catch (err) {
        console.warn('Could not fetch backend syllabus subjects, using fallback:', err);
        setSubjectsList(SUBJECTS.slice(0, parseInt(classId) > 10 ? 10 : 6).map(s => ({
          id: s.id,
          name: s.name,
          code: `${s.name.substring(0, 3).toUpperCase()}-${classId}`,
          description: `Core ${board.name} syllabus for ${s.name}`,
          color: s.color,
          icon: s.icon,
          chaptersCount: 12
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchBoardSubjects();
  }, [boardId, classId]);

  return (
    <div style={{ paddingTop: 'var(--space-12)' }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' }}>
        <Link to="/syllabus" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4) 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Syllabus
        </Link>
      </div>

      <section style={{ padding: 'var(--space-8) 0', background: 'var(--gradient-surface)' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Badge variant="primary">{board.name}</Badge>
            {board.state && <Badge variant="warning">🏛️ {board.state}</Badge>}
            <Badge variant="neutral">{cls.name}</Badge>
          </div>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-3)' }}>
            {board.name} Syllabus — {cls.name}
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>
            Complete curriculum, chapter breakdowns, and study materials for {board.fullName || board.name} {cls.name}.
          </p>
        </div>
      </section>

      <section style={{ padding: 'var(--space-12) 0 var(--space-20)' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              Curated Subjects ({subjectsList.length})
            </h2>
            <Link 
              to={ROUTES.MY_SYLLABUS}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-accent)',
                fontWeight: '600',
                fontSize: 'var(--text-sm)',
                textDecoration: 'none'
              }}
            >
              <Sparkles size={16} /> Open in Student Hub
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              Loading {board.name} curriculum...
            </div>
          ) : (
            <div className="responsive-grid-3" style={{ gap: 'var(--space-4)' }} ref={gridRef}>
              {subjectsList.map((subj) => {
                const Icon = Icons[subj.icon] || BookOpen;
                return (
                  <div 
                    key={subj.id} 
                    onClick={() => navigate(ROUTES.MY_SYLLABUS)}
                    style={{ 
                      background: 'var(--color-surface)', 
                      borderRadius: 'var(--radius-xl)', 
                      padding: 'var(--space-6)', 
                      border: '1px solid var(--color-border-light)', 
                      boxShadow: 'var(--shadow-card)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      cursor: 'pointer', 
                      transition: 'all 0.3s' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: `${subj.color}14`, color: subj.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: '600', marginBottom: '2px', fontSize: '15px' }}>{subj.name}</h3>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                          {subj.code} • {subj.chaptersCount || 8} Chapters
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--color-text-tertiary)" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SyllabusDetail;
