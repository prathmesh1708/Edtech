import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, FileText, Zap, Mic, StickyNote, ArrowRight, Play, BookOpen } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import { SUBJECTS } from '../../../../config/constants';
import { useAuth } from '../../../../models/context/AuthContext';
import Card, { FeatureCard } from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import Button from '../../../components/common/Button/Button';

const s = {
  welcomeCard: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-8)',
    boxShadow: 'var(--shadow-md)',
    marginBottom: 'var(--space-8)',
    border: '1px solid var(--color-border-light)',
    width: '100%'
  },
  aiCard: {
    background: 'var(--gradient-accent)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6)',
    color: 'var(--color-white)',
    marginBottom: 'var(--space-8)',
    boxShadow: 'var(--shadow-glow)',
    cursor: 'pointer',
    width: '100%'
  },
  sectionTitle: {
    fontSize: 'var(--text-lg)',
    fontWeight: '700',
    fontFamily: 'var(--font-heading)',
    marginBottom: 'var(--space-4)',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  toolsGrid: {
    marginBottom: 'var(--space-8)'
  },
  subjectsGrid: {
    width: '100%'
  },
  subjectCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-3)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all var(--transition-base)',
    width: '100%'
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentUser = user || { name: 'John Doe', classId: '10' };

  return (
    <div>
      {/* Welcome Card */}
      <div style={s.welcomeCard} className="responsive-flex-between">
        <div>
          <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>Ready to Top It? 🚀</Badge>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)' }}>
            Good Morning, {currentUser.name}!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Track your syllabus, doubt-solve with AI, and access resources.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'rgba(245, 158, 11, 0.08)', padding: '8px 16px', borderRadius: 'var(--radius-full)', color: 'var(--color-warning)' }}>
          <Zap size={16} fill="currentColor" />
          <span style={{ fontWeight: '700' }}>Streak: 3 Days</span>
        </div>
      </div>

      {/* AI Doubt Solver Banner */}
      <div style={s.aiCard} onClick={() => navigate(ROUTES.AI_TUTOR)} className="responsive-flex-between">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Badge variant="gradient" style={{ width: 'fit-content' }}>AI Doubt Solver</Badge>
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700' }}>Stuck on a question?</h3>
          <p style={{ opacity: 0.9 }}>Snap it, solve it, understand it instantly.</p>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
          <ArrowRight size={24} />
        </div>
      </div>

      {/* Learning Tools */}
      <div>
        <h3 style={s.sectionTitle}>
          <span>Learning Tools</span>
        </h3>
        <div style={s.toolsGrid} className="responsive-grid-4">
          <FeatureCard
            icon={Bot}
            title="Ask AI Tutor"
            description="Chat with your personalized tutor"
            color="var(--color-secondary)"
            onClick={() => navigate(ROUTES.AI_TUTOR)}
          />
          <FeatureCard
            icon={FileText}
            title="PDF Study"
            description="Chat with your textbooks"
            color="#EF4444"
            onClick={() => navigate(ROUTES.AI_TUTOR)}
          />
          <FeatureCard
            icon={Zap}
            title="Resources"
            description="Find best study materials"
            color="var(--color-accent)"
            onClick={() => navigate(ROUTES.MY_SYLLABUS)}
          />
          <FeatureCard
            icon={StickyNote}
            title="Smart Notes"
            description="Organize concepts & notes"
            color="#22C55E"
            onClick={() => navigate(ROUTES.NOTES)}
          />
        </div>
      </div>

      {/* Recommended Subjects */}
      <div>
        <h3 style={s.sectionTitle}>
          <span>Your Subjects</span>
          <Link to={ROUTES.MY_SYLLABUS} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Syllabus <ArrowRight size={14} />
          </Link>
        </h3>
        
        <div style={s.subjectsGrid} className="responsive-grid-5">
          {SUBJECTS.slice(0, 5).map((subj) => (
            <div
              key={subj.id}
              style={s.subjectCard}
              className="subject-card-hover"
              onClick={() => navigate(ROUTES.MY_SYLLABUS)}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: `${subj.color}14`, color: subj.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} />
              </div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>{subj.name}</h4>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>10 Chapters</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
