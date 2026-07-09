import React from 'react';
import { Users, BookOpen, Clock, Activity, BarChart3, ShieldCheck } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';

const s = {
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
  chartsGrid: {
    width: '100%'
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

const AdminDashboard = () => {
  return (
    <div>
      {/* Stats Counter Row */}
      <div style={s.statsGrid} className="responsive-grid-4">
        <Card style={{ padding: 0 }}>
          <div style={s.statCard}>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Total Students</span>
              <h3 style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', marginTop: '4px' }}>12,840</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'rgba(79, 110, 247, 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={s.statCard}>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Active Sessions</span>
              <h3 style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', marginTop: '4px' }}>1,204</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={s.statCard}>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>AI Questions Solved</span>
              <h3 style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', marginTop: '4px' }}>42,912</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'rgba(124, 92, 252, 0.1)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={24} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={s.statCard}>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Content Approvals</span>
              <h3 style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', marginTop: '4px' }}>98%</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts & Lists */}
      <div style={s.chartsGrid} className="responsive-grid-2-1">
        {/* Left Side: Activity chart simulator */}
        <Card>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' }}>Platform Activity Analytics</h3>
          <div style={{ height: '240px', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-end', padding: 'var(--space-6)', gap: '12px', justifyContent: 'space-around' }}>
            {[40, 55, 45, 60, 75, 90, 85, 95, 110, 100, 120, 130].map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ width: '100%', height: `${h}px`, background: 'var(--gradient-primary)', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>M{i+1}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Side: Recent activity log */}
        <Card>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' }}>Recent Activity</h3>
          <div style={s.recentList}>
            {[
              { text: 'Aarav Sharma added study note', time: '2 mins ago', badge: 'Note' },
              { text: 'Priya Patel solved math question', time: '10 mins ago', badge: 'AI Solve' },
              { text: 'New student onboarded Class 8', time: '24 mins ago', badge: 'Onboard' },
              { text: 'Updated CBSE Science syllabus', time: '1 hour ago', badge: 'Syllabus' },
            ].map((r, i) => (
              <div key={i} style={s.recentRow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600' }}>{r.text}</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{r.time}</span>
                </div>
                <Badge variant="primary" size="sm">{r.badge}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
