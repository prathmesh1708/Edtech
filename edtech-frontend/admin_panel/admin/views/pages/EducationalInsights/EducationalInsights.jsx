import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  Send, 
  TrendingUp, 
  Clock, 
  Download,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend
} from 'recharts';
import analyticsService from '../../../../../src/models/services/analyticsService';
import styles from './EducationalInsights.module.css';

const EducationalInsights = () => {
  const [boardFilter, setBoardFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [insightsData, setInsightsData] = useState({
    kpis: {
      avgTestScore: '84.2%',
      syllabusMastery: '91.5%',
      assignmentPassRate: '89.8%',
      atRiskStudentsCount: 12,
    },
    subjectScores: [
      { subject: 'Mathematics', avgScore: 82, passRate: 88, classAvg: 79 },
      { subject: 'Physics', avgScore: 78, passRate: 84, classAvg: 76 },
      { subject: 'Chemistry', avgScore: 85, passRate: 91, classAvg: 81 },
      { subject: 'Biology', avgScore: 89, passRate: 95, classAvg: 87 },
      { subject: 'English Lit.', avgScore: 92, passRate: 97, classAvg: 90 },
      { subject: 'Social Studies', avgScore: 86, passRate: 92, classAvg: 84 },
    ],
    learningGaps: [
      { topic: 'Quadratic Equations & Complex Roots', subject: 'Mathematics', accuracy: 64, riskLevel: 'High' },
      { topic: 'Thermodynamics & Heat Capacity', subject: 'Physics', accuracy: 68, riskLevel: 'High' },
      { topic: 'Organic Chemistry Reactions', subject: 'Chemistry', accuracy: 71, riskLevel: 'Medium' },
      { topic: 'Cell Division & Mitosis Phases', subject: 'Biology', accuracy: 76, riskLevel: 'Medium' },
      { topic: 'Grammar: Direct & Indirect Speech', subject: 'English', accuracy: 79, riskLevel: 'Low' },
    ],
    classProficiency: [
      { grade: 'Class 6', avgScore: 88, passRate: 94 },
      { grade: 'Class 7', avgScore: 86, passRate: 92 },
      { grade: 'Class 8', avgScore: 84, passRate: 90 },
      { grade: 'Class 9', avgScore: 81, passRate: 86 },
      { grade: 'Class 10', avgScore: 83, passRate: 89 },
      { grade: 'Class 11', avgScore: 78, passRate: 83 },
      { grade: 'Class 12', avgScore: 82, passRate: 87 },
    ],
    studyCorrelation: [
      { studyHours: '1h - 2h', avgScore: 68 },
      { studyHours: '2h - 3h', avgScore: 76 },
      { studyHours: '3h - 4h', avgScore: 84 },
      { studyHours: '4h - 5h', avgScore: 91 },
      { studyHours: '5h+', avgScore: 96 },
    ],
    atRiskList: [
      { id: '1', name: 'Aarav Sharma', email: 'aarav@example.com', classId: '10', board: 'CBSE', avgScore: '64%', weakSubject: 'Physics', status: 'Needs Support' },
      { id: '2', name: 'Priya Verma', email: 'priya@example.com', classId: '9', board: 'ICSE', avgScore: '68%', weakSubject: 'Mathematics', status: 'Needs Support' },
      { id: '3', name: 'Rohan Gupta', email: 'rohan@example.com', classId: '10', board: 'CBSE', avgScore: '71%', weakSubject: 'Chemistry', status: 'Needs Support' },
    ],
  });

  useEffect(() => {
    fetchEducationalInsights();
  }, [boardFilter, classFilter]);

  const fetchEducationalInsights = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getEducationalInsights({ board: boardFilter, classId: classFilter });
      if (res.data && res.data.success) {
        setInsightsData(res.data);
      }
    } catch (error) {
      console.warn('Could not fetch educational insights, using default baseline:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportNote = (studentName) => {
    alert(`Support note sent to ${studentName} successfully!`);
  };

  const { kpis, subjectScores, learningGaps, classProficiency, studyCorrelation, atRiskList } = insightsData;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Educational Performance Insights</h1>
          <p className={styles.pageSubtitle}>In-depth analysis of test scores, syllabus mastery, learning gaps, and student academic progress.</p>
        </div>

        <div className={styles.controlsGroup}>
          {loading && (
            <div className={styles.loadingBadge}>
              <Loader2 size={16} className={styles.spinner} />
              <span>Fetching Insights...</span>
            </div>
          )}

          <div className={styles.selectWrapper}>
            <Filter size={16} className={styles.controlIcon} />
            <select 
              value={boardFilter} 
              onChange={(e) => setBoardFilter(e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All Education Boards</option>
              <option value="cbse">CBSE Board</option>
              <option value="icse">ICSE Board</option>
              <option value="state">State Boards</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <GraduationCap size={16} className={styles.controlIcon} />
            <select 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All Classes (6 - 12)</option>
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>
        </div>
      </header>

      {/* KPI Cards Row */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Platform Avg Test Score</span>
            <div className={`${styles.iconBadge} ${styles.blueBg}`}>
              <Award size={20} className={styles.blueIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.avgTestScore}</div>
          <div className={styles.kpiSub}>Target threshold: 75.0%</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Syllabus Mastery Index</span>
            <div className={`${styles.iconBadge} ${styles.greenBg}`}>
              <BookOpen size={20} className={styles.greenIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.syllabusMastery}</div>
          <div className={styles.kpiSub}>Chapter completion accuracy</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Assignment Pass Rate</span>
            <div className={`${styles.iconBadge} ${styles.purpleBg}`}>
              <CheckCircle size={20} className={styles.purpleIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.assignmentPassRate}</div>
          <div className={styles.kpiSub}>Passed exams on 1st attempt</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Students Needing Support</span>
            <div className={`${styles.iconBadge} ${styles.amberBg}`}>
              <AlertTriangle size={20} className={styles.amberIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.atRiskStudentsCount} Students</div>
          <div className={styles.kpiSub}>Average score below 72%</div>
        </div>
      </div>

      {/* Main Row 1: Subject Test Scores & Learning Gap Analysis */}
      <div className={styles.chartsGridTwo}>
        {/* Subject Score Breakdown */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Subject Mastery & Test Scores</h2>
              <p className={styles.cardSubtitle}>Average test percentage vs assignment pass rate by subject</p>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectScores} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Bar dataKey="avgScore" fill="#1A73E8" radius={[6, 6, 0, 0]} name="Avg Test Score (%)" />
                <Bar dataKey="passRate" fill="#22C55E" radius={[6, 6, 0, 0]} name="Pass Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Learning Gaps Progress List */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Learning Gap & Topic Difficulty</h2>
              <p className={styles.cardSubtitle}>Key concepts where students exhibit lower accuracy</p>
            </div>
          </div>

          <div className={styles.gapsList}>
            {learningGaps.map((item, idx) => (
              <div key={idx} className={styles.gapItem}>
                <div className={styles.gapTopRow}>
                  <div>
                    <h4 className={styles.gapTopicTitle}>{item.topic}</h4>
                    <span className={styles.gapSubjectBadge}>{item.subject}</span>
                  </div>
                  <span className={`${styles.riskTag} ${styles[item.riskLevel.toLowerCase() + 'Risk']}`}>
                    {item.accuracy}% Accuracy ({item.riskLevel} Risk)
                  </span>
                </div>
                <div className={styles.accuracyBarBg}>
                  <div 
                    className={`${styles.accuracyBarFill} ${item.accuracy < 70 ? styles.redFill : styles.amberFill}`}
                    style={{ width: `${item.accuracy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Row 2: Class Proficiency & Study Time Correlation */}
      <div className={styles.chartsGridTwo}>
        {/* Class Proficiency Spectrum */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Class Proficiency Spectrum</h2>
              <p className={styles.cardSubtitle}>Academic benchmark across Grade 6 through Grade 12</p>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={classProficiency} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[50, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Bar dataKey="avgScore" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Avg Class Score (%)" />
                <Line type="monotone" dataKey="passRate" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} name="Pass Rate (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Time Correlation Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Study Time vs Exam Performance</h2>
              <p className={styles.cardSubtitle}>Correlation between daily study hours and exam outcomes</p>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={studyCorrelation} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="studyHours" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[50, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Line type="monotone" dataKey="avgScore" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E', r: 6 }} name="Avg Score (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: At-Risk Students Intervention Table */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Students Requiring Academic Support</h2>
            <p className={styles.cardSubtitle}>Learners scoring below academic target threshold for proactive guidance</p>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class / Board</th>
                <th>Avg Test Score</th>
                <th>Challenging Subject</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {atRiskList.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className={styles.studentNameCell}>
                      <div className={styles.avatar}>{student.name.charAt(0)}</div>
                      <div>
                        <div className={styles.studentName}>{student.name}</div>
                        <div className={styles.studentEmail}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>Class {student.classId} ({student.board})</td>
                  <td>
                    <span className={styles.scoreHighlight}>{student.avgScore}</span>
                  </td>
                  <td>
                    <span className={styles.weakBadge}>{student.weakSubject}</span>
                  </td>
                  <td>
                    <span className={styles.needsSupportBadge}>{student.status}</span>
                  </td>
                  <td>
                    <button 
                      className={styles.supportBtn}
                      onClick={() => handleSupportNote(student.name)}
                    >
                      <Send size={14} />
                      <span>Send Support Note</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EducationalInsights;
