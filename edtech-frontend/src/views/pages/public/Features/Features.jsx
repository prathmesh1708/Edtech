import React from 'react';
import { BotMessageSquare, FileText, Zap, Mic, StickyNote, Target, BookOpen, Brain, Bell, Bookmark, Languages, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';
import CTABanner from '../../../components/sections/CTABanner/CTABanner';

const ALL_FEATURES = [
  { icon: BotMessageSquare, title: 'AI Doubt Solver', desc: 'Ask any academic question and get instant step-by-step solutions. Chapter explanations, topic summaries, and personalized study guidance.', color: '#7C5CFC', bg: '#F3E8FF' },
  { icon: FileText, title: 'PDF Study', desc: 'Upload and interact with your textbook PDFs. Ask questions about specific chapters and get answers directly from the content.', color: '#EF4444', bg: '#FEE2E2' },
  { icon: Zap, title: 'Resources Library', desc: 'Access curated study materials, reference books, and educational resources organized by class, board, and subject.', color: '#4F6EF7', bg: '#EEF2FF' },
  { icon: Mic, title: 'Audio Notes', desc: 'Record lectures and study sessions. AI automatically transcribes and summarizes key points for quick revision.', color: '#F59E0B', bg: '#FEF3C7' },
  { icon: StickyNote, title: 'Smart Notes', desc: 'Create organized, searchable notes with AI-powered suggestions. Link notes to chapters and topics for easy revision.', color: '#22C55E', bg: '#DCFCE7' },
  { icon: Target, title: 'Focus Mode', desc: 'Distraction-free study environment with AI tools, timer, and progress tracking for productive study sessions.', color: '#3B82F6', bg: '#DBEAFE' },
  { icon: BookOpen, title: 'Chapter-wise Notes', desc: 'Detailed notes for every chapter across all subjects, aligned with your board syllabus. Download PDFs for offline access.', color: '#14B8A6', bg: '#CCFBF1' },
  { icon: Brain, title: 'Exam Preparation', desc: 'Practice questions, mock tests, and AI-generated question papers based on previous year patterns for exam readiness.', color: '#EC4899', bg: '#FCE7F3' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Get learning reminders, new content alerts, and academic announcements to stay on top of your study schedule.', color: '#F97316', bg: '#FED7AA' },
  { icon: Bookmark, title: 'Bookmarks & Favorites', desc: 'Save important questions, topics, and resources for quick access. Organize favorites by subject and priority.', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: Languages, title: 'Multi-Language', desc: 'Study in your preferred language. Content available in multiple Indian languages for better understanding.', color: '#06B6D4', bg: '#CFFAFE' },
  { icon: HelpCircle, title: 'In-App Support', desc: 'Submit doubts, get help from experts, and access our support desk for any platform or academic queries.', color: '#64748B', bg: '#F1F5F9' },
];

const pageStyles = {
  hero: { padding: 'var(--space-16) 0', background: 'var(--gradient-surface)', textAlign: 'center', paddingTop: 'var(--space-12)' },
  container: { maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' },
  tag: { display: 'inline-flex', padding: 'var(--space-1) var(--space-4)', background: 'rgba(79,110,247,0.08)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' },
  title: { fontSize: 'var(--text-5xl)', fontWeight: '800', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' },
  subtitle: { fontSize: 'var(--text-xl)', color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' },
  grid: { padding: 'var(--space-20) 0', maxWidth: 'var(--max-width)', margin: '0 auto', paddingLeft: 'var(--space-6)', paddingRight: 'var(--space-6)' },
  card: { background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', transition: 'all 0.3s ease' },
  iconWrap: { width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 'var(--text-xl)', fontWeight: '600', fontFamily: 'var(--font-heading)' },
  cardDesc: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.6' },
  highlights: { padding: 'var(--space-20) 0', background: 'var(--color-bg)' },
  highlightGrid: { maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' },
  highlightContent: { display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' },
  checkList: { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' },
  checkItem: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' },
};

const Features = () => {
  const gridRef = useScrollAnimation('stagger', { stagger: 0.08 });

  return (
    <div>
      <section style={pageStyles.hero}>
        <div style={pageStyles.container}>
          <span style={pageStyles.tag}>⚡ Features</span>
          <h1 style={pageStyles.title}>Powerful Tools for <span className="text-gradient">Every Student</span></h1>
          <p style={pageStyles.subtitle}>
            Everything you need to study smarter, prepare better, and score higher — powered by AI and designed for Indian students.
          </p>
        </div>
      </section>

      <div style={pageStyles.grid} className="responsive-grid-3" ref={gridRef}>
        {ALL_FEATURES.map((f) => (
          <div key={f.title} style={pageStyles.card} className="feature-card-hover">
            <div style={{ ...pageStyles.iconWrap, background: f.bg, color: f.color }}>
              <f.icon size={26} />
            </div>
            <h3 style={pageStyles.cardTitle}>{f.title}</h3>
            <p style={pageStyles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>

      <section style={pageStyles.highlights}>
        <div style={pageStyles.highlightGrid} className="responsive-grid-2">
          <div style={pageStyles.highlightContent}>
            <span style={pageStyles.tag}>🤖 AI-Powered</span>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              Instant Step-by-Step Solutions for Any Question
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: 'var(--text-lg)' }}>
              Our AI assistant acts as your personal tutor — available 24/7 to help with any academic question.
            </p>
            <div style={pageStyles.checkList}>
              {['Chapter explanations', 'Topic summaries & simplification', 'Question-answer generation', 'Learning recommendations', 'Exam preparation support'].map((item) => (
                <div key={item} style={pageStyles.checkItem}>
                  <CheckCircle size={18} color="var(--color-success)" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link to={ROUTES.REGISTER} style={{ marginTop: 'var(--space-4)' }}>
              <Button variant="primary" iconRight={<ArrowRight size={18} />}>Try AI Tutor Free</Button>
            </Link>
          </div>
          <div style={{ background: 'var(--gradient-accent)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-12)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'white' }}>
            <div style={{ textAlign: 'center' }}>
              <BotMessageSquare size={64} style={{ marginBottom: 'var(--space-4)', opacity: 0.9 }} />
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>AI Tutor</h3>
              <p style={{ opacity: 0.8 }}>Ask anything, learn everything</p>
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
};

export default Features;
