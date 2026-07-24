import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, Activity, Loader2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import analyticsService from '../../../../../src/models/services/analyticsService';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className={styles.statCard}>
    <div className={styles.statHeader}>
      <h3 className={styles.statTitle}>{title}</h3>
      <div className={styles.iconWrapper}>
        <Icon size={20} className={styles.statIcon} />
      </div>
    </div>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statTrend}>
      <span className={trend >= 0 ? styles.positive : styles.negative}>
        {trend >= 0 ? '+' : ''}{trend}%
      </span>
      <span className={styles.trendLabel}> from last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalActiveLearners: '12,450',
      totalSyllabuses: 142,
      avgStudyTime: '4h 20m',
      quizCompletionRate: '84%',
    },
    userGrowthData: [
      { date: 'Jun 11', activeUsers: 4000 },
      { date: 'Jun 15', activeUsers: 3000 },
      { date: 'Jun 19', activeUsers: 2000 },
      { date: 'Jun 23', activeUsers: 2780 },
      { date: 'Jun 27', activeUsers: 1890 },
      { date: 'Jul 1',  activeUsers: 2390 },
      { date: 'Jul 5',  activeUsers: 3490 },
      { date: 'Jul 7',  activeUsers: 12000 },
      { date: 'Jul 10', activeUsers: 18540 },
    ],
    subjectData: [
      { name: 'Mathematics', value: 38, color: '#1A73E8' },
      { name: 'Science', value: 28, color: '#22C55E' },
      { name: 'English', value: 18, color: '#F59E0B' },
      { name: 'Social Studies', value: 10, color: '#8B5CF6' },
    ]
  });

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getAnalyticsData({ timeRange: '30d' });
      if (res.data && res.data.success) {
        setDashboardData(res.data);
      }
    } catch (error) {
      console.warn('Could not fetch live dashboard overview stats, using baseline trends:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const { kpis, userGrowthData, subjectData } = dashboardData;

  const formattedCategoryData = (subjectData || []).map((item, idx) => ({
    name: item.name,
    value: item.value || 10,
    color: item.color || ['#1A73E8', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'][idx % 5]
  }));

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p className={styles.pageSubtitle}>Welcome back, here's what's happening today in real time.</p>
        </div>

        {loading && (
          <div className={styles.loadingBadge}>
            <Loader2 size={16} className={styles.spinner} />
            <span>Syncing Real-Time Stats...</span>
          </div>
        )}
      </header>

      <div className={styles.statsGrid}>
        <StatCard title="Total Students" value={kpis?.totalActiveLearners || '0'} icon={Users} trend={12.5} />
        <StatCard title="Active Courses" value={kpis?.totalSyllabuses || '0'} icon={BookOpen} trend={5.2} />
        <StatCard title="Avg. Study Time" value={kpis?.avgStudyTime || '2h 45m'} icon={Clock} trend={8.6} />
        <StatCard title="Platform Engagement" value={kpis?.quizCompletionRate || '88.4%'} icon={Activity} trend={8.1} />
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Engagement Analytics</h2>
            <p className={styles.sectionSubtitle}>Monthly active users trends</p>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1A73E8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                />
                <Area type="monotone" dataKey="activeUsers" stroke="#1A73E8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" name="Active Learners" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className={styles.pieSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top Categories</h2>
            <p className={styles.sectionSubtitle}>Course breakdown by subject</p>
          </div>
          <div className={styles.pieContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {formattedCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className={styles.customLegend}>
              {formattedCategoryData.map((item, index) => (
                <div key={index} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: item.color }}></div>
                  <span className={styles.legendName}>{item.name}</span>
                  <span className={styles.legendValue}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
