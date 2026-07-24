import React from 'react';
import { 
  ArrowLeft, Award, BookOpen, CheckCircle, FileText, Download, 
  Printer, TrendingUp, BarChart2, Star, CheckSquare, Layers 
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import styles from '../StudentManagement.module.css';

const StudentAcademicView = ({ student, onBack }) => {
  if (!student) return null;

  // Mock Subject-wise Academic Marks
  const subjectRecords = [
    { subject: 'Mathematics', code: 'MATH-101', internal: 24, termExam: 68, total: 92, grade: 'A+', status: 'Passed', attendance: 96 },
    { subject: 'Physics', code: 'PHY-102', internal: 23, termExam: 64, total: 87, grade: 'A', status: 'Passed', attendance: 92 },
    { subject: 'Chemistry', code: 'CHEM-103', internal: 25, termExam: 69, total: 94, grade: 'A+', status: 'Passed', attendance: 98 },
    { subject: 'Biology', code: 'BIO-104', internal: 22, termExam: 62, total: 84, grade: 'A', status: 'Passed', attendance: 90 },
    { subject: 'English Literature', code: 'ENG-105', internal: 24, termExam: 65, total: 89, grade: 'A', status: 'Passed', attendance: 95 },
    { subject: 'Social Studies', code: 'SST-106', internal: 21, termExam: 61, total: 82, grade: 'B+', status: 'Passed', attendance: 88 }
  ];

  // Radar Chart Data for Performance Radar
  const radarData = subjectRecords.map(item => ({
    subject: item.subject,
    score: item.total,
    fullMark: 100
  }));

  // Certificates Earned
  const certificates = [
    { id: 1, title: 'Certificate of Excellence - Mathematics Olympiad 2026', issued: '2026-06-15', code: 'CERT-MATH-2026-01' },
    { id: 2, title: 'Course Completion - Class 10 Chemistry Core', issued: '2026-05-10', code: 'CERT-CHEM-2026-44' },
    { id: 3, title: 'Top Performer Award - Q2 Academic Term', issued: '2026-04-01', code: 'CERT-AWARD-2026-09' }
  ];

  const calculateOverallGPA = () => {
    const sum = subjectRecords.reduce((acc, curr) => acc + curr.total, 0);
    const avg = (sum / subjectRecords.length).toFixed(1);
    return { avg, gpa: (avg / 20 - 1).toFixed(2) };
  };

  const { avg, gpa } = calculateOverallGPA();

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileHeaderNav}>
          <button className={styles.backButton} onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Profile</span>
          </button>
        </div>
        <div className={styles.headerTitleRow}>
          <div>
            <h1 className={styles.title}>Academic Records & Grade Summary</h1>
            <p className={styles.subtitle}>Detailed marksheets, subject performance, attendance metrics, and certificates for {student.name}</p>
          </div>
          <button className={styles.primaryButton} onClick={handlePrintReport}>
            <Printer size={16} />
            <span>Print Progress Report</span>
          </button>
        </div>
      </header>

      {/* Grade Summary Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <Award size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{avg}% ({gpa} GPA)</div>
            <div className={styles.kpiLabel}>Overall Percentage & GPA</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(79, 110, 247, 0.1)', color: '#4F6EF7' }}>
            <Star size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>Grade A+</div>
            <div className={styles.kpiLabel}>Academic Grade Band</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>Rank #3</div>
            <div className={styles.kpiLabel}>Class Rank (Out of 45)</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0EA5E9' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>94.2%</div>
            <div className={styles.kpiLabel}>Overall Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Charts & Marks Overview */}
      <div className={styles.chartsGrid}>
        {/* Subject-Wise Performance Radar */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Subject Competency Radar</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" />
                <Radar name="Total Score" dataKey="score" stroke="#1A73E8" fill="#1A73E8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Scores Bar Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Subject Marks Breakdown (Out of 100)</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectRecords}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="subject" stroke="#64748B" fontSize={11} interval={0} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="total" name="Total Marks" fill="#4F6EF7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject-Wise Marks Table & Attendance */}
      <div className={styles.detailsGrid}>
        <div className={`${styles.detailCard} ${styles.colSpan2}`}>
          <div className={styles.detailCardHeader}>
            <FileText size={18} className={styles.detailIcon} />
            <h2>Subject-wise Marks & Grades</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Code</th>
                  <th>Internal (30)</th>
                  <th>Term Exam (70)</th>
                  <th>Total (100)</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectRecords.map((item, idx) => (
                  <tr key={idx}>
                    <td className={styles.cellName}>{item.subject}</td>
                    <td>{item.code}</td>
                    <td>{item.internal}</td>
                    <td>{item.termExam}</td>
                    <td style={{ fontWeight: 'bold', color: '#1A73E8' }}>{item.total}</td>
                    <td>
                      <span className={styles.gradeTag}>{item.grade}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles.active}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject-Wise Attendance Progress */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <CheckSquare size={18} className={styles.detailIcon} />
            <h2>Subject Attendance Breakdown</h2>
          </div>
          <div className={styles.attendanceList}>
            {subjectRecords.map((sub, idx) => (
              <div key={idx} className={styles.attendanceItem}>
                <div className={styles.attendanceLabelRow}>
                  <span className={styles.attendanceSubName}>{sub.subject}</span>
                  <span className={styles.attendancePctVal}>{sub.attendance}%</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${sub.attendance}%`,
                      backgroundColor: sub.attendance >= 90 ? '#22C55E' : sub.attendance >= 75 ? '#F59E0B' : '#EF4444'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Earned Certificates List */}
      <div className={styles.detailCard} style={{ marginTop: '1.5rem' }}>
        <div className={styles.detailCardHeader}>
          <Award size={18} className={styles.detailIcon} />
          <h2>Earned Certificates & Badges</h2>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Certificate Title</th>
                <th>Verification Code</th>
                <th>Issue Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(cert => (
                <tr key={cert.id}>
                  <td className={styles.cellName}>{cert.title}</td>
                  <td><code>{cert.code}</code></td>
                  <td>{cert.issued}</td>
                  <td>
                    <button className={styles.iconButton} title="Download Certificate PDF" onClick={() => alert(`Downloading ${cert.title}...`)}>
                      <Download size={14} />
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

export default StudentAcademicView;
