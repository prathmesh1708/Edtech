import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, Award, Clock, ArrowRight, BookOpen, Bot, FileText, 
  ChevronRight, CheckCircle2, Circle, Trophy, BarChart2, Plus, Calendar, CheckSquare, Trash2, RefreshCw
} from 'lucide-react';
import { ROUTES, generateRoute } from '../../../../../src/config/routes';
import { useAuth } from '../../../../../src/models/context/AuthContext';
import studentService from '../../../../../src/models/services/studentService';
import Card from '../../../../../src/views/components/common/Card/Card';
import Badge from '../../../../../src/views/components/common/Badge/Badge';
import Button from '../../../../../src/views/components/common/Button/Button';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentUser = user || { name: 'Aarav Sharma', classId: '10', board: 'CBSE' };

  // Dynamic state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overallSyllabusProgress: 0,
    aiQueriesCount: 0,
    studyHours: 0,
    classRank: '#-',
    streak: 5
  });
  const [subjects, setSubjects] = useState([]);
  const [todos, setTodos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [streakClicked, setStreakClicked] = useState(false);

  // Fetch Dashboard data from Backend API
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getDashboardData({
        board: currentUser.board || 'cbse',
        class: currentUser.classId || '10'
      });
      if (res.data) {
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.subjects) setSubjects(res.data.subjects);
        if (res.data.todos) setTodos(res.data.todos);
        if (res.data.activities) setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Streak handler
  const handleStreakClick = () => {
    if (!streakClicked) {
      setStats(prev => ({ ...prev, streak: prev.streak + 1 }));
      setStreakClicked(true);
      alert('Awesome! You have boosted your streak by checking in today! 🌟');
    } else {
      alert('Your streak is already updated for today. Keep learning to retain your streak! 🔥');
    }
  };

  // Toggle todo task in MongoDB backend
  const toggleTodo = async (id) => {
    try {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      await studentService.toggleTodo(id);
    } catch (err) {
      console.error('Error toggling todo:', err);
    }
  };

  // Delete todo task from MongoDB backend
  const deleteTodo = async (id) => {
    try {
      setTodos(prev => prev.filter(t => t.id !== id));
      await studentService.deleteTodo(id);
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  // Add todo task to MongoDB backend
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const textToSubmit = newTodo.trim();
      setNewTodo('');
      const res = await studentService.createTodo(textToSubmit);
      if (res.data) {
        setTodos(prev => [res.data, ...prev]);
      }
    } catch (err) {
      console.error('Error creating todo task:', err);
    }
  };

  const handleSubjectClick = (subjectId) => {
    navigate(generateRoute(ROUTES.SUBJECT_DETAIL, { subjectId }));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div>
      {/* Welcome Card banner */}
      <div className={`${styles.welcomeCard} responsive-flex-between`}>
        <div>
          <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>WELCOME BACK 🎓</Badge>
          <h2 className={styles.welcomeTitle}>
            Good Afternoon, {currentUser.name}!
          </h2>
          <p className={styles.welcomeSub}>
            You have completed <b>{completedCount} of {todos.length}</b> tasks for today. Continue learning to crush your goals!
          </p>
        </div>
        <div 
          onClick={handleStreakClick}
          className={`${styles.streakBadge} subject-card-hover`}
          style={{ 
            background: streakClicked ? 'rgba(34, 197, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)', 
            color: streakClicked ? 'var(--color-success)' : 'var(--color-warning)',
            border: `1px solid ${streakClicked ? 'var(--color-success)' : 'var(--color-warning)'}24`,
          }}
        >
          <Zap size={18} fill="currentColor" />
          <span style={{ fontWeight: '700', fontSize: 'var(--text-sm)' }}>
            Streak: {stats.streak} {stats.streak > 1 ? 'Days' : 'Day'}
          </span>
        </div>
      </div>

      {/* Grid of Key Progress statistics */}
      <div className={`${styles.statsGrid} responsive-grid-4`}>
        <Card style={{ padding: 0 }}>
          <div className={styles.statCard}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Overall Syllabus</span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginTop: '4px' }}>{stats.overallSyllabusProgress}%</h3>
            </div>
            <div className={styles.statIcon} style={{ background: 'rgba(79, 110, 247, 0.1)', color: 'var(--color-accent)' }}>
              <BookOpen size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div className={styles.statCard}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>AI Tutor Queries</span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginTop: '4px' }}>{stats.aiQueriesCount} asked</h3>
            </div>
            <div className={styles.statIcon} style={{ background: 'rgba(124, 92, 252, 0.1)', color: 'var(--color-secondary)' }}>
              <Bot size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div className={styles.statCard}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Study Hours</span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginTop: '4px' }}>{stats.studyHours} hrs</h3>
            </div>
            <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)' }}>
              <Clock size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div className={styles.statCard}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Class Rank</span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginTop: '4px' }}>{stats.classRank}</h3>
            </div>
            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
              <Trophy size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* AI Doubt Solver Banner */}
      <div className={`${styles.aiCard} responsive-flex-between subject-card-hover`} onClick={() => navigate(ROUTES.AI_TUTOR)}>
        <div className={styles.aiCardContent}>
          <Badge variant="success" style={{ width: 'fit-content', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>AI ASSISTANT</Badge>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--color-white)', fontFamily: 'var(--font-heading)' }}>Stuck on a homework question?</h3>
          <p style={{ opacity: 0.9, color: 'var(--color-white)', fontSize: 'var(--text-sm)' }}>Ask our smart AI doubt solver for step-by-step assistance and clear visual guides instantly.</p>
        </div>
        <div className={styles.aiCardIcon}>
          <ArrowRight size={20} />
        </div>
        <div className={styles.aiCardDecorator}>
          <Bot size={150} />
        </div>
      </div>

      {/* Subject Progress Cards */}
      <div>
        <div className={styles.sectionTitle}>
          <span>My Enrolled Subjects ({currentUser.board?.toUpperCase() || 'CBSE'} Class {currentUser.classId || '10'})</span>
          <Link to={ROUTES.MY_SYLLABUS} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Full Syllabus <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-secondary)' }}>
            Loading live subject data from backend...
          </div>
        ) : subjects.length > 0 ? (
          <div className={`${styles.subjectsGrid} responsive-grid-3`}>
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className={`${styles.subjectCard} subject-card-hover`}
                onClick={() => handleSubjectClick(subj.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div className={styles.subjectIcon} style={{ background: `${subj.color || '#4F6EF7'}14`, color: subj.color || '#4F6EF7' }}>
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
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${subj.progress}%`, background: subj.color || '#4F6EF7' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: subj.color || '#4F6EF7', fontSize: 'var(--text-xs)', fontWeight: '700', gap: '4px' }}>
                  <span>Continue Study</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-8)', border: '1px dashed var(--color-border)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>No subjects found for your standard. Subjects added by Admin will appear here.</p>
          </div>
        )}
      </div>

      {/* Checklist and Activity Feed Grid */}
      <div className={`${styles.interactiveGrid} responsive-grid-2-1`}>
        {/* Live Todolist */}
        <div className={styles.todoCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Today's Study Plan</h3>
            <Badge variant="primary" size="sm">{todos.length - completedCount} pending</Badge>
          </div>

          <form onSubmit={addTodo} className={styles.inputGroup}>
            <input 
              type="text" 
              placeholder="Add a study goal (e.g. Solve physics problems)..." 
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className={styles.todoInput}
            />
            <Button type="submit" size="sm" style={{ padding: '0 16px' }} iconLeft={<Plus size={16} />}>
              Add
            </Button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
            {todos.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: 'var(--space-6) 0', fontSize: 'var(--text-sm)' }}>
                No study items scheduled. Add one to start! 👍
              </p>
            ) : (
              todos.map(todo => (
                <div key={todo.id} className={styles.todoItem} style={{ opacity: todo.completed ? 0.6 : 1 }}>
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
                    style={{ color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}
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
          <div className={styles.recentList}>
            {activities.length > 0 ? (
              activities.map((r, i) => (
                <div key={r.id || i} className={styles.recentRow}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>{r.text}</span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>
                  <Badge variant={i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'success'} size="sm">
                    {r.badge || 'Activity'}
                  </Badge>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>No recent activity logged.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
