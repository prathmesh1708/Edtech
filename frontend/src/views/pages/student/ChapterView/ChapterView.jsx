import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, Play, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';

const s = {
  grid: {
    width: '100%'
  },
  header: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border-light)',
    marginBottom: 'var(--space-8)'
  },
  topicRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border-light)',
    cursor: 'pointer'
  },
  sidebarCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    marginBottom: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)'
  },
  resourceBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-border)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    background: 'var(--color-surface)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 'var(--space-3)'
  }
};

const MOCK_TOPICS = [
  { id: 't-1', name: 'Introduction to Real Numbers', completed: true },
  { id: 't-2', name: 'Euclid\'s Division Lemma', completed: true },
  { id: 't-3', name: 'Fundamental Theorem of Arithmetic', completed: false },
  { id: 't-4', name: 'Revisiting Irrational Numbers', completed: false },
  { id: 't-5', name: 'Rational Numbers and Decimals', completed: false },
];

const ChapterView = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState(MOCK_TOPICS);

  const toggleTopic = (id) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div>
      <Link to={ROUTES.MY_SYLLABUS} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Subject
      </Link>

      <div style={s.header}>
        <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>Chapter 1</Badge>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)' }}>
          Real Numbers
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Explore basic mathematical properties of rational and irrational numbers.
        </p>
      </div>

      <div style={s.grid} className="responsive-grid-2-1">
        {/* Left Side: Topic Flow */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-border-light)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700' }}>Topic-wise Learning Flow</h3>
          </div>
          <div>
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                style={s.topicRow}
                onClick={() => toggleTopic(topic.id)}
                className="subject-card-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {topic.completed ? (
                    <CheckCircle2 size={20} color="var(--color-success)" />
                  ) : (
                    <Circle size={20} color="var(--color-text-tertiary)" />
                  )}
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '500',
                    color: topic.completed ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                    textDecoration: topic.completed ? 'line-through' : 'none'
                  }}>
                    {index + 1}. {topic.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Side: Chapter Study Resources */}
        <div>
          <div style={s.sidebarCard}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Downloadable Resources</h3>
            
            <button style={s.resourceBtn} className="subject-card-hover" onClick={() => alert('Downloading chapter notes PDF...')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} color="var(--color-accent)" />
                <span>Chapter Notes (PDF)</span>
              </div>
              <Badge variant="success" size="sm">Available</Badge>
            </button>

            <button style={s.resourceBtn} className="subject-card-hover" onClick={() => alert('Playing video explanation...')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={16} color="var(--color-warning)" />
                <span>Video Lesson</span>
              </div>
              <Badge variant="primary" size="sm">12 Mins</Badge>
            </button>
          </div>

          <div style={{ ...s.sidebarCard, background: 'var(--gradient-accent)', border: 'none', color: 'white' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Ask AI Tutor</h3>
            <p style={{ fontSize: 'var(--text-xs)', opacity: 0.9, marginBottom: 'var(--space-4)', lineHeight: '1.5' }}>
              Have questions about this chapter? Get step-by-step doubt clearing instantly.
            </p>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              iconLeft={<Sparkles size={14} />}
              onClick={() => navigate(ROUTES.AI_TUTOR)}
              style={{ color: 'var(--color-accent)' }}
            >
              Start Doubt Solving
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterView;
