import React from 'react';
import { Users, BookOpen, Clock, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
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
      <span className={trend > 0 ? styles.positive : styles.negative}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
      <span className={styles.trendLabel}> from last month</span>
    </div>
  </div>
);

// Sample data for Area Chart
const engagementData = [
  { name: 'Jun 11', value: 4000 },
  { name: 'Jun 15', value: 3000 },
  { name: 'Jun 19', value: 2000 },
  { name: 'Jun 23', value: 2780 },
  { name: 'Jun 27', value: 1890 },
  { name: 'Jul 1',  value: 2390 },
  { name: 'Jul 5',  value: 3490 },
  { name: 'Jul 7',  value: 12000 },
  { name: 'Jul 10', value: 3400 },
];

// Sample data for Pie Chart
const categoryData = [
  { name: 'Science', value: 72, color: '#1A73E8' },
  { name: 'Math', value: 15, color: '#22C55E' },
  { name: 'English', value: 8, color: '#F59E0B' },
  { name: 'History', value: 5, color: '#EF4444' },
];

const Dashboard = () => {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        <p className={styles.pageSubtitle}>Welcome back, here's what's happening today.</p>
      </header>

      <div className={styles.statsGrid}>
        <StatCard title="Total Students" value="12,450" icon={Users} trend={12.5} />
        <StatCard title="Active Courses" value="142" icon={BookOpen} trend={5.2} />
        <StatCard title="Avg. Study Time" value="4h 20m" icon={Clock} trend={-2.4} />
        <StatCard title="Platform Engagement" value="84%" icon={Activity} trend={8.1} />
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Engagement Analytics</h2>
            <p className={styles.sectionSubtitle}>Monthly active users trends</p>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1A73E8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                />
                <Area type="monotone" dataKey="value" stroke="#1A73E8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
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
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
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
              {categoryData.map((item, index) => (
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
