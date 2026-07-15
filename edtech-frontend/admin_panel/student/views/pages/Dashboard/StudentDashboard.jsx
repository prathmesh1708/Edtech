import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, Award, Clock, ArrowRight, BookOpen, Bot, FileText, 
  ChevronRight, CheckCircle2, Circle, Trophy, BarChart2, Plus, Calendar, CheckSquare, Trash2
} from 'lucide-react';
import { ROUTES, generateRoute } from '../../../../../src/config/routes';
import { SUBJECTS } from '../../../../../src/config/constants';
import { useAuth } from '../../../../../src/models/context/AuthContext';
import Card, { FeatureCard } from '../../../../../src/views/components/common/Card/Card';
import Badge from '../../../../../src/views/components/common/Badge/Badge';
import Button from '../../../../../src/views/components/common/Button/Button';

const s = {
  welcomeCard: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6) var(--space-8)',
    boxShadow: 'var(--shadow-sm)',
    marginBottom: 'var(--space-8)',
    border: '1px solid var(--color-border-light)',
    width: '100%'
  },
  statsGrid: {
    width: '100%',
    marginBottom: 'var(--space-8)'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-5) var(--space-6)'
  },
  aiCard: {
    background: 'var(--gradient-accent)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6) var(--space-8)',
    color: 'var(--color-white)',
    marginBottom: 'var(--space-8)',
    boxShadow: 'var(--shadow-glow)',
    cursor: 'pointer',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  aiCardDecorator: {
    position: 'absolute',
    right: '-20px',
    bottom: '-20px',
    opacity: 0.1,
    color: 'white',
    pointerEvents: 'none'
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
  subjectsGrid: {
    width: '100%',
    marginBottom: 'var(--space-8)'
  },
  subjectCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    width: '100%',
    boxShadow: 'var(--shadow-card)'
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: 'var(--color-border-light)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    marginTop: 'var(--space-2)'
  },
  interactiveGrid: {
    width: '100%'
  },
  todoCard: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    border: '1px solid var(--color-border-light)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-3) 0',
    borderBottom: '1px solid var(--color-border-light)',
    transition: 'opacity 0.2s'
  },
  inputGroup: {
    display: 'flex',
    gap: 'var(--space-2)',
    marginTop: 'var(--space-2)'
  },
  todoInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-border)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    background: 'var(--color-bg-alt)'
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)'
  },
  recentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-3) 0',
    borderBottom: '1px solid var(--color-border-light)'
  }
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentUser = user || { name: 'Aarav Sharma', classId: '10', board: 'CBSE' };

  // Streaks interactive state
  const [streak, setStreak] = useState(5);
  const [streakClicked, setStreakClicked] = useState(false);

  // Live checklist state
  const [todos, setTodos] = useState([
    { id: 1, text: 'Complete Math Quiz on Real Numbers', completed: true },
    { id: 2, text: 'Read Biology Chapter 3 summary notes', completed: false },
    { id: 3, text: 'Solve 3 chemistry doubts with AI Tutor', completed: false },
    { id: 4, text: 'Revise English grammar notes', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  // Handle streak click for engagement
  const handleStreakClick = () => {
    if (!streakClicked) {
      setStreak(prev => prev + 1);
      setStreakClicked(true);
      alert('Awesome! You have boosted your streak by checking in. Complete a topic to make it official! 🌟');
    } else {
      alert('Your streak is already updated for today. Keep learning to retain your streak! 🔥');
    }
  };

  // Toggle todo item
  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Add todo
  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: newTodo.trim(), completed: false }
    ]);
    setNewTodo('');
  };

  const handleSubjectClick = (subjectId) => {
    // Check if the subject is standard and navigate to detail page
    navigate(generateRoute(ROUTES.SUBJECT_DETAIL, { subjectId }));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div>
      {/* Welcome Card banner */}
      <div style={s.welcomeCard} className="responsive-flex-between">
        <div>
          <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>WELCOME BACK 🎓</Badge>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)' }}>
            Good Afternoon, {currentUser.name}!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            You have completed <b>{completedCount} of {todos.length}</b> tasks for today. Continue learning to crush your goals!
          </p>
        </div>
        <div 
          onClick={handleStreakClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-2)', 
            background: streakClicked ? 'rgba(34, 197, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)', 
            padding: '10px 20px', 
            borderRadius: 'var(--radius-full)', 
            color: streakClicked ? 'var(--color-success)' : 'var(--color-warning)',
            cursor: 'pointer',
            border: `1px solid ${streakClicked ? 'var(--color-success)' : 'var(--color-warning)'}24`,
            transition: 'all 0.3s'
          }}
          className="subject-card-hover"
        >
          <Zap size={18} fill="currentColor" />
          <span style={{ fontWeight: '700', fontSize: 'var(--text-sm)' }}>
            Streak: {streak} {streak > 1 ? 'Days' : 'Day'}
          </span>
        </div>
      </div>

      {/* Grid of Key Progress statistics */}
      <div style={s.statsGrid} className="responsive-grid-4">
        <Card style={{ padding: 0 }}>
          <div style={s.statCard}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Overall Syllabus</span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginTop: '4px' }}>64%</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'rgba(79, 110, 247, 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={s.statCard}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>AI Tutor Queries</span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginTop: '4px' }}>42 asked</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'rgba(124, 92, 252, 0.1)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={s.statCard}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Study Hours</span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginTop: '4px' }}>18.5 hrs</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={s.statCard}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Class Rank</span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginTop: '4px' }}>#3</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* AI Doubt Solver Banner */}
      <div style={s.aiCard} onClick={() => navigate(ROUTES.AI_TUTOR)} className="responsive-flex-between subject-card-hover">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
          <Badge variant="success" style={{ width: 'fit-content', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>AI ASSISTANT</Badge>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--color-white)', fontFamily: 'var(--font-heading)' }}>Stuck on a homework question?</h3>
          <p style={{ opacity: 0.9, color: 'var(--color-white)', fontSize: 'var(--text-sm)' }}>Ask our smart AI doubt solver for step-by-step assistance and clear visual guides instantly.</p>
        </div>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0, zIndex: 2 }}>
          <ArrowRight size={20} />
        </div>
        <div style={s.aiCardDecorator}>
          <Bot size={150} />
        </div>
      </div>

      {/* Subject Progress Cards */}
      <div>
        <div style={s.sectionTitle}>
          <span>My Enrolled Subjects</span>
          <Link to={ROUTES.MY_SYLLABUS} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Full Syllabus <ArrowRight size={14} />
          </Link>
        </div>

        <div style={s.subjectsGrid} className="responsive-grid-3">
          {[
            { id: 'mathematics', name: 'Mathematics', chapters: '12 Chapters', progress: 75, color: '#4F6EF7' },
            { id: 'science', name: 'Science', chapters: '15 Chapters', progress: 50, color: '#22C55E' },
            { id: 'english', name: 'English', chapters: '8 Chapters', progress: 85, color: '#F59E0B' }
          ].map((subj) => (
            <div
              key={subj.id}
              style={s.subjectCard}
              className="subject-card-hover"
              onClick={() => handleSubjectClick(subj.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: `${subj.color}14`, color: subj.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>{subj.name}</h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{subj.chapters}</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  <span>Chapter Progress</span>
                  <span>{subj.progress}%</span>
                </div>
                <div style={s.progressBar}>
                  <div style={{ width: `${subj.progress}%`, height: '100%', background: subj.color, borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: subj.color, fontSize: 'var(--text-xs)', fontWeight: '700', gap: '4px' }}>
                <span>Continue Study</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist and Activity Feed Grid */}
      <div style={s.interactiveGrid} className="responsive-grid-2-1">
        {/* Live Todolist */}
        <div style={s.todoCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Today's Study Plan</h3>
            <Badge variant="primary" size="sm">{todos.length - completedCount} pending</Badge>
          </div>

          <form onSubmit={addTodo} style={s.inputGroup}>
            <input 
              type="text" 
              placeholder="Add a study goal (e.g. Solve physics problems)..." 
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              style={s.todoInput}
            />
            <Button type="submit" size="sm" style={{ padding: '0 16px' }} iconLeft={<Plus size={16} />}>
              Add
            </Button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
            {todos.length === 0 ? (
              <p style={{ textSelf: 'center', textAlign: 'center', color: 'var(--color-text-tertiary)', padding: 'var(--space-6) 0', fontSize: 'var(--text-sm)' }}>
                No study items scheduled. Add one to start! 👍
              </p>
            ) : (
              todos.map(todo => (
                <div key={todo.id} style={{ ...s.todoItem, opacity: todo.completed ? 0.6 : 1 }}>
                  <div 
                    onClick={() => toggleTodo(todo.id)} 
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', flex: 1 }}
                  >
                    {todo.completed ? (
                      <CheckCircle2 size={18} color="var(--color-success)" />
                    ) : (
                      <Circle size={18} color="var(--color-text-tertiary)" />
                    )}
                    <span style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: '500', 
                      color: 'var(--color-text-primary)',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      transition: 'all 0.2s'
                    }}>
                      {todo.text}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)} 
                    style={{ color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px' }}
                    className="trash-hover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity feed */}
        <Card>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)' }}>Recent Activity</h3>
          <div style={s.recentList}>
            {[
              { text: 'Completed: real numbers test quiz', time: '15 mins ago', badge: 'Practice' },
              { text: 'Asked AI Tutor about "osmosis"', time: '1 hour ago', badge: 'AI Doubts' },
              { text: 'Created chemistry notes on carbon', time: '3 hours ago', badge: 'Notes' },
              { text: 'Completed 12m Mathematics Video lesson', time: 'Yesterday', badge: 'Video' },
            ].map((r, i) => (
              <div key={i} style={s.recentRow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>{r.text}</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{r.time}</span>
                </div>
                <Badge variant={i === 1 ? 'secondary' : i === 2 ? 'success' : 'primary'} size="sm">{r.badge}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;

