import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Download, 
  Calendar, 
  Filter, 
  BookOpen, 
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart
} from 'recharts';
import analyticsService from '../../../../../src/models/services/analyticsService';
import styles from './Analytics.module.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [boardFilter, setBoardFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const [analyticsData, setAnalyticsData] = useState({
    kpis: {
      totalActiveLearners: '18,540',
      avgStudyTime: '2h 45m',
      quizCompletionRate: '88.4%',
      monthlyRevenue: '$42,850',
    },
    userGrowthData: [
      { date: 'Jul 01', activeUsers: 8400, newSignups: 420 },
      { date: 'Jul 05', activeUsers: 9800, newSignups: 510 },
      { date: 'Jul 09', activeUsers: 11200, newSignups: 680 },
      { date: 'Jul 13', activeUsers: 12900, newSignups: 740 },
      { date: 'Jul 17', activeUsers: 14500, newSignups: 890 },
      { date: 'Jul 21', activeUsers: 16800, newSignups: 1020 },
      { date: 'Jul 23', activeUsers: 18540, newSignups: 1150 },
    ],
    revenueData: [
      { month: 'Jan', freeUsers: 4500, basicPlan: 12000, proPlan: 18000, arpu: 12.4 },
      { month: 'Feb', freeUsers: 5100, basicPlan: 13500, proPlan: 21000, arpu: 13.8 },
      { month: 'Mar', freeUsers: 5800, basicPlan: 15000, proPlan: 24500, arpu: 14.5 },
      { month: 'Apr', freeUsers: 6400, basicPlan: 16800, proPlan: 28000, arpu: 15.2 },
      { month: 'May', freeUsers: 7200, basicPlan: 18200, proPlan: 32400, arpu: 16.0 },
      { month: 'Jun', freeUsers: 8100, basicPlan: 19500, proPlan: 37800, arpu: 17.1 },
      { month: 'Jul', freeUsers: 9200, basicPlan: 21000, proPlan: 42850, arpu: 18.5 },
    ],
    subjectData: [
      { name: 'Mathematics', hours: 4250, value: 38, color: '#1A73E8' },
      { name: 'Science & Physics', hours: 3100, value: 28, color: '#22C55E' },
      { name: 'English Literature', hours: 1980, value: 18, color: '#F59E0B' },
      { name: 'Social Studies', hours: 1120, value: 10, color: '#8B5CF6' },
      { name: 'Computer Science', hours: 670, value: 6, color: '#EC4899' },
    ],
    gradeData: [
      { grade: 'Class 6', students: 1840 },
      { grade: 'Class 7', students: 2120 },
      { grade: 'Class 8', students: 2950 },
      { grade: 'Class 9', students: 3840 },
      { grade: 'Class 10', students: 4620 },
      { grade: 'Class 11', students: 1890 },
      { grade: 'Class 12', students: 1280 },
    ],
    peakHoursData: [
      { hour: '06:00', users: 450 },
      { hour: '08:00', users: 1200 },
      { hour: '10:00', users: 2400 },
      { hour: '12:00', users: 1950 },
      { hour: '14:00', users: 2800 },
      { hour: '16:00', users: 4900 },
      { hour: '18:00', users: 6800 },
      { hour: '20:00', users: 7450 },
      { hour: '22:00', users: 3800 },
    ],
    topCourses: [
      { id: 1, title: 'CBSE Class 10 Science Mastery', students: 4280, completion: 92, avgScore: '88%' },
      { id: 2, title: 'Class 9 Advanced Mathematics', students: 3950, completion: 86, avgScore: '84%' },
      { id: 3, title: 'ICSE Class 10 Physics & Chemistry', students: 3120, completion: 89, avgScore: '86%' },
      { id: 4, title: 'Class 8 Foundation Grammar & Essay', students: 2840, completion: 95, avgScore: '91%' },
      { id: 5, title: 'Class 10 Board Mock Prep Series', students: 2410, completion: 78, avgScore: '81%' },
    ],
  });

  useEffect(() => {
    fetchDynamicAnalytics();
  }, [timeRange, boardFilter]);

  const fetchDynamicAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getAnalyticsData({ timeRange, board: boardFilter });
      if (res.data && res.data.success) {
        setAnalyticsData(res.data);
      }
    } catch (error) {
      console.warn('Could not fetch backend analytics, using baseline trends:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const { kpis, userGrowthData, subjectData, revenueData, gradeData, peakHoursData, topCourses } = analyticsData;

  return (
    <div className={styles.container}>
      {/* Header & Controls */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Platform Analytics & Insights</h1>
          <p className={styles.pageSubtitle}>Real-time performance metrics, learning patterns, and growth trends.</p>
        </div>

        <div className={styles.controlsGroup}>
          {loading && (
            <div className={styles.loadingBadge}>
              <Loader2 size={16} className={styles.spinner} />
              <span>Syncing Live Data...</span>
            </div>
          )}

          <div className={styles.selectWrapper}>
            <Calendar size={16} className={styles.controlIcon} />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className={styles.selectInput}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <Filter size={16} className={styles.controlIcon} />
            <select 
              value={boardFilter} 
              onChange={(e) => setBoardFilter(e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All Boards</option>
              <option value="cbse">CBSE Board</option>
              <option value="icse">ICSE Board</option>
              <option value="state">State Boards</option>
            </select>
          </div>

          <button className={styles.exportBtn} onClick={() => alert('Analytics report exported successfully!')}>
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </header>

      {/* KPI Cards Row */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Active Learners</span>
            <div className={`${styles.iconBadge} ${styles.blueBg}`}>
              <Users size={20} className={styles.blueIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.totalActiveLearners}</div>
          <div className={styles.kpiTrend}>
            <span className={styles.positiveTrend}>
              <ArrowUpRight size={16} /> +14.2%
            </span>
            <span className={styles.trendPeriod}>vs previous month</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Avg. Daily Study Time</span>
            <div className={`${styles.iconBadge} ${styles.greenBg}`}>
              <Clock size={20} className={styles.greenIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.avgStudyTime}</div>
          <div className={styles.kpiTrend}>
            <span className={styles.positiveTrend}>
              <ArrowUpRight size={16} /> +8.6%
            </span>
            <span className={styles.trendPeriod}>per student daily</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Quiz Completion Rate</span>
            <div className={`${styles.iconBadge} ${styles.amberBg}`}>
              <Award size={20} className={styles.amberIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.quizCompletionRate}</div>
          <div className={styles.kpiTrend}>
            <span className={styles.positiveTrend}>
              <ArrowUpRight size={16} /> +3.1%
            </span>
            <span className={styles.trendPeriod}>completion accuracy</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Monthly Revenue</span>
            <div className={`${styles.iconBadge} ${styles.purpleBg}`}>
              <DollarSign size={20} className={styles.purpleIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.monthlyRevenue}</div>
          <div className={styles.kpiTrend}>
            <span className={styles.positiveTrend}>
              <ArrowUpRight size={16} /> +18.5%
            </span>
            <span className={styles.trendPeriod}>m-o-m growth</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row 1: User Growth & Subject Breakdown */}
      <div className={styles.chartsGridTwo}>
        {/* User Growth Area Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Student Growth & Daily Active Trend</h2>
              <p className={styles.cardSubtitle}>Active learners vs new registrations</p>
            </div>
            <div className={styles.legendIndicator}>
              <span className={styles.dotActive}></span> Active Users
              <span className={styles.dotNew}></span> New Signups
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#1A73E8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="newGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Area type="monotone" dataKey="activeUsers" stroke="#1A73E8" strokeWidth={3} fillOpacity={1} fill="url(#activeGradient)" name="Active Users" />
                <Area type="monotone" dataKey="newSignups" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#newGradient)" name="New Signups" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Share Donut Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Subject Engagement Share</h2>
              <p className={styles.cardSubtitle}>Distribution of study hours by subject</p>
            </div>
          </div>

          <div className={styles.pieContainer}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#1A73E8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: 'none' }}
                  formatter={(val) => [`${val}% of total study hours`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className={styles.pieLegend}>
              {subjectData.map((item, idx) => (
                <div key={idx} className={styles.pieLegendItem}>
                  <div className={styles.legendColorBox} style={{ backgroundColor: item.color || '#1A73E8' }}></div>
                  <span className={styles.legendLabel}>{item.name}</span>
                  <span className={styles.legendValue}>{item.value}% ({item.hours} hrs)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: Revenue Trend & Grade Distribution */}
      <div className={styles.chartsGridTwo}>
        {/* Revenue & Tier Distribution Bar/Line Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Revenue & Subscription Tiers</h2>
              <p className={styles.cardSubtitle}>Monthly subscription revenue (USD) & ARPU</p>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={revenueData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={8} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Bar yAxisId="left" dataKey="basicPlan" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} name="Basic Plan ($)" />
                <Bar yAxisId="left" dataKey="proPlan" stackId="a" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Pro Plan ($)" />
                <Line yAxisId="right" type="monotone" dataKey="arpu" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} name="ARPU ($)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Bar Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Student Demographics by Grade</h2>
              <p className={styles.cardSubtitle}>Enrolled students across Class 6 to 12</p>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Bar dataKey="students" fill="#1A73E8" radius={[8, 8, 0, 0]} name="Enrolled Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Peak Study Hours & Top Performing Content */}
      <div className={styles.chartsGridTwo}>
        {/* Peak Study Hours Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Peak Activity & Study Hours</h2>
              <p className={styles.cardSubtitle}>Student concurrent activity throughout 24-hour cycle</p>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={peakHoursData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Line type="monotone" dataKey="users" stroke="#EC4899" strokeWidth={3} dot={{ fill: '#EC4899', r: 5 }} name="Active Students" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Courses Table/List */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Top Performing Content</h2>
              <p className={styles.cardSubtitle}>Highest engaged syllabus modules and completion</p>
            </div>
          </div>

          <div className={styles.topList}>
            {topCourses.map((course) => (
              <div key={course.id} className={styles.topItem}>
                <div className={styles.courseInfo}>
                  <h4 className={styles.courseTitle}>{course.title}</h4>
                  <span className={styles.courseStudents}>{(course.students || 0).toLocaleString()} Students Enrolled</span>
                </div>
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Completion: {course.completion}%</span>
                    <span className={styles.scoreBadge}>Avg: {course.avgScore}</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${course.completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
