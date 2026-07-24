import React, { useState } from 'react';
import { 
  ArrowLeft, Clock, Monitor, Smartphone, Tablet, Download, 
  CheckCircle, AlertCircle, FileText, HelpCircle, Activity, 
  Calendar, Layers, ShieldCheck, CheckSquare 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import styles from '../StudentManagement.module.css';

const StudentActivityView = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState('all');

  if (!student) return null;

  // Mock data for Activity Monitoring Charts
  const dailyData = [
    { day: 'Mon', hours: 2.5, quizzes: 3 },
    { day: 'Tue', hours: 4.1, quizzes: 5 },
    { day: 'Wed', hours: 3.8, quizzes: 4 },
    { day: 'Thu', hours: 5.2, quizzes: 6 },
    { day: 'Fri', hours: 3.0, quizzes: 2 },
    { day: 'Sat', hours: 6.5, quizzes: 8 },
    { day: 'Sun', hours: 4.0, quizzes: 5 },
  ];

  const weeklyData = [
    { week: 'Week 1', studyHours: 22, lessons: 14 },
    { week: 'Week 2', studyHours: 28, lessons: 18 },
    { week: 'Week 3', studyHours: 35, lessons: 24 },
    { week: 'Week 4', studyHours: 31, lessons: 20 },
  ];

  const monthlyEngagementData = [
    { month: 'Jan', engagement: 68, testsPassed: 8 },
    { month: 'Feb', engagement: 74, testsPassed: 10 },
    { month: 'Mar', engagement: 82, testsPassed: 12 },
    { month: 'Apr', engagement: 90, testsPassed: 15 },
    { month: 'May', engagement: 86, testsPassed: 13 },
    { month: 'Jun', engagement: 94, testsPassed: 18 },
  ];

  // Login History Log
  const loginHistory = [
    { id: 1, time: '2026-07-24 09:14:22', ip: '192.168.1.45', device: 'Desktop / Windows 11', browser: 'Chrome 126.0', location: 'New York, US', status: 'Success' },
    { id: 2, time: '2026-07-23 18:30:10', ip: '192.168.1.45', device: 'Mobile / iPhone 15', browser: 'Safari Mobile', location: 'New York, US', status: 'Success' },
    { id: 3, time: '2026-07-22 14:05:44', ip: '172.56.21.90', device: 'Tablet / iPad Pro', browser: 'Safari', location: 'New York, US', status: 'Success' },
    { id: 4, time: '2026-07-20 11:20:00', ip: '192.168.1.45', device: 'Desktop / Windows 11', browser: 'Chrome 126.0', location: 'New York, US', status: 'Success' },
  ];

  // Quiz Attempts
  const quizAttempts = [
    { id: 1, quiz: 'Real Numbers & Polynomials Quiz', subject: 'Mathematics', score: '92%', date: '2026-07-23', status: 'Passed' },
    { id: 2, quiz: 'Cell Biology Chapter Test', subject: 'Biology', score: '88%', date: '2026-07-22', status: 'Passed' },
    { id: 3, quiz: 'Chemical Reactions Assessment', subject: 'Chemistry', score: '95%', date: '2026-07-20', status: 'Passed' },
    { id: 4, quiz: 'English Grammar Diagnostic', subject: 'English', score: '78%', date: '2026-07-18', status: 'Passed' },
  ];

  // Assignment History
  const assignments = [
    { id: 1, title: 'Quadratic Equations Worksheet 4', subject: 'Mathematics', submitted: '2026-07-23 16:40', grade: 'A+', status: 'Graded' },
    { id: 2, title: 'Photosynthesis Lab Experiment Report', subject: 'Biology', submitted: '2026-07-21 12:15', grade: 'A', status: 'Graded' },
    { id: 3, title: 'Periodic Table & Valency Assignment', subject: 'Chemistry', submitted: '2026-07-19 20:10', grade: 'A+', status: 'Graded' },
  ];

  // Download History
  const downloadHistory = [
    { id: 1, file: 'NCERT Class 10 Math Solutions.pdf', category: 'Study Material', size: '4.2 MB', date: '2026-07-24 10:05' },
    { id: 2, file: 'Biology Chapter 3 Revision Notes.pdf', category: 'Notes', size: '1.8 MB', date: '2026-07-22 15:30' },
    { id: 3, file: 'Chemistry Sample Question Paper 2026.pdf', category: 'Exams', size: '3.1 MB', date: '2026-07-19 11:45' },
  ];

  // Activity Timeline
  const timeline = [
    { id: 1, text: 'Completed Lesson 4: Quadratic Formulas in Mathematics', time: '2 hours ago', type: 'lesson' },
    { id: 2, text: 'Submitted assignment: Quadratic Equations Worksheet 4', time: 'Yesterday at 4:40 PM', type: 'assignment' },
    { id: 3, text: 'Scored 92% in Real Numbers & Polynomials Quiz', time: 'Yesterday at 2:15 PM', type: 'quiz' },
    { id: 4, text: 'Downloaded NCERT Class 10 Math Solutions.pdf', time: 'Jul 22, 2026', type: 'download' },
    { id: 5, text: 'Logged in from Windows Desktop (Chrome 126)', time: 'Jul 22, 2026', type: 'login' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileHeaderNav}>
          <button className={styles.backButton} onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Profile</span>
          </button>
        </div>
        <div>
          <h1 className={styles.title}>Activity & Engagement Monitoring</h1>
          <p className={styles.subtitle}>Tracking study hours, login audit logs, course progress & download history for {student.name}</p>
        </div>
      </header>

      {/* Summary KPI Banner */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(79, 110, 247, 0.1)', color: '#4F6EF7' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>142.5 hrs</div>
            <div className={styles.kpiLabel}>Total Study Time</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <Monitor size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>Today, 09:14 AM</div>
            <div className={styles.kpiLabel}>Last Active Login</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>36 Lessons</div>
            <div className={styles.kpiLabel}>Completed Lessons</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308' }}>
            <Download size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>18 Downloads</div>
            <div className={styles.kpiLabel}>Materials Downloaded</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Daily Activity Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Daily Learning Activity (Hours Spent)</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="hours" name="Study Hours" fill="#1A73E8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Learning Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Weekly Learning Progress</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F6EF7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none' }}
                />
                <Area type="monotone" dataKey="studyHours" name="Study Hours" stroke="#4F6EF7" fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Engagement Chart */}
        <div className={`${styles.chartCard} ${styles.fullWidthChart}`}>
          <div className={styles.chartHeader}>
            <h3>Monthly Engagement & Test Passing Trend</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyEngagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none' }}
                />
                <Legend />
                <Line type="monotone" dataKey="engagement" name="Engagement Score (%)" stroke="#22C55E" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="testsPassed" name="Quizzes Passed" stroke="#A855F7" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Login History & Activity Logs */}
      <div className={styles.detailsGrid}>
        {/* Login History Card */}
        <div className={`${styles.detailCard} ${styles.colSpan2}`}>
          <div className={styles.detailCardHeader}>
            <Monitor size={18} className={styles.detailIcon} />
            <h2>Login History & Device Audit</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Device / OS</th>
                  <th>Browser</th>
                  <th>IP Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map(log => (
                  <tr key={log.id}>
                    <td className={styles.cellName}>{log.time}</td>
                    <td>{log.device}</td>
                    <td>{log.browser}</td>
                    <td>{log.ip}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles.active}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Timeline Feed */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <Activity size={18} className={styles.detailIcon} />
            <h2>Real-time Activity Timeline</h2>
          </div>
          <div className={styles.timelineList}>
            {timeline.map(item => (
              <div key={item.id} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <p className={styles.timelineText}>{item.text}</p>
                  <span className={styles.timelineTime}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Attempts & Submissions */}
      <div className={styles.detailsGrid}>
        {/* Quiz Attempts */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <CheckSquare size={18} className={styles.detailIcon} />
            <h2>Recent Quiz Attempts</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {quizAttempts.map(quiz => (
                  <tr key={quiz.id}>
                    <td className={styles.cellName}>{quiz.quiz}</td>
                    <td>{quiz.subject}</td>
                    <td style={{ fontWeight: 'bold', color: '#22C55E' }}>{quiz.score}</td>
                    <td>{quiz.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Downloads History */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <Download size={18} className={styles.detailIcon} />
            <h2>Resource Download History</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Downloaded</th>
                </tr>
              </thead>
              <tbody>
                {downloadHistory.map(dl => (
                  <tr key={dl.id}>
                    <td className={styles.cellName}>{dl.file}</td>
                    <td>{dl.category}</td>
                    <td>{dl.size}</td>
                    <td>{dl.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentActivityView;
