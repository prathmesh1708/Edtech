import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, ClipboardList, ShieldAlert, Loader2 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import aiAdminService from '../../../../../src/models/services/aiAdminService';
import { ROUTES } from '../../../../../src/config/routes';
import styles from './Analytics.module.css';

// The Analytics page offers 'ytd'; AI insights go back at most 90 days.
const RANGE_FOR = { '7d': '7d', '30d': '30d', '90d': '90d', ytd: '90d' };
const MODE_COLORS = { text: '#38BDF8', voice: '#8B5CF6', image: '#F59E0B' };
const MODE_LABELS = { text: 'Typed', voice: 'Voice', image: 'Photo' };
const tooltipStyle = {
  backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', borderRadius: '12px',
  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)',
};
const axisTick = { fill: 'var(--color-text-secondary)', fontSize: 12 };

const formatDay = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const classLabel = (classId) => (/^\d+$/.test(classId) ? `Class ${classId}` : classId);

/** AI tutor usage section of the Analytics page. */
const AITutorInsights = ({ timeRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const range = RANGE_FOR[timeRange] || '30d';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    aiAdminService
      .getInsights(range)
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load AI tutor insights.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const header = (
    <div className={styles.header} style={{ marginTop: 'var(--space-8)' }}>
      <div>
        <h2 className={styles.pageTitle} style={{ fontSize: 'var(--text-2xl)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={22} color="var(--color-accent)" /> AI Tutor Insights
        </h2>
        <p className={styles.pageSubtitle}>
          How students use the AI tutor{range !== timeRange ? ' (last 90 days)' : ''}.
        </p>
      </div>
      {loading && (
        <div className={styles.loadingBadge}>
          <Loader2 size={16} className={styles.spinner} /> Loading...
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <section>
        {header}
        <p className={styles.cardSubtitle}>{error}</p>
      </section>
    );
  }
  if (!data) return <section>{header}</section>;

  const { totals, quizzes, safety } = data;
  const daily = data.daily.map((d) => ({ ...d, label: formatDay(d.date) }));
  const modes = Object.entries(data.inputModes)
    .map(([mode, value]) => ({ mode, name: MODE_LABELS[mode], value }))
    .filter((m) => m.value > 0);
  const modeTotal = modes.reduce((s, m) => s + m.value, 0);
  const classes = data.classes.map((c) => ({ ...c, label: classLabel(c.classId) }));
  const hours = data.peakHours.map((h) => ({ ...h, label: `${String(h.hour).padStart(2, '0')}:00` }));
  const maxTopic = Math.max(1, ...data.topics.map((t) => t.questions));

  return (
    <section>
      {header}

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Questions Asked</span>
            <div className={`${styles.iconBadge} ${styles.blueBg}`}><Sparkles size={20} className={styles.blueIcon} /></div>
          </div>
          <div className={styles.kpiValue}>{totals.questions.toLocaleString('en-IN')}</div>
          <div className={styles.kpiTrend}><span className={styles.trendPeriod}>in {totals.conversations.toLocaleString('en-IN')} chats</span></div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Students Using AI</span>
            <div className={`${styles.iconBadge} ${styles.greenBg}`}><Users size={20} className={styles.greenIcon} /></div>
          </div>
          <div className={styles.kpiValue}>{totals.students.toLocaleString('en-IN')}</div>
          <div className={styles.kpiTrend}><span className={styles.trendPeriod}>{totals.avgPerStudent} questions per student</span></div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Practice Quizzes</span>
            <div className={`${styles.iconBadge} ${styles.amberBg}`}><ClipboardList size={20} className={styles.amberIcon} /></div>
          </div>
          <div className={styles.kpiValue}>{quizzes.submitted.toLocaleString('en-IN')}</div>
          <div className={styles.kpiTrend}>
            <span className={styles.trendPeriod}>
              completed of {quizzes.generated} · avg score {quizzes.avgScorePct == null ? '—' : `${quizzes.avgScorePct}%`}
            </span>
          </div>
        </div>

        <Link to={ROUTES.ADMIN_AI_SAFETY} className={styles.kpiCard} style={{ textDecoration: 'none' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Safety Review</span>
            <div className={`${styles.iconBadge} ${styles.purpleBg}`}><ShieldAlert size={20} className={styles.purpleIcon} /></div>
          </div>
          <div className={styles.kpiValue} style={safety.urgentOpen ? { color: 'var(--color-error)' } : undefined}>{safety.open}</div>
          <div className={styles.kpiTrend}>
            <span className={styles.trendPeriod}>
              open flags{safety.urgentOpen ? ` · ${safety.urgentOpen} urgent` : ''} · {totals.blocked} blocked answers
            </span>
          </div>
        </Link>
      </div>

      {totals.questions === 0 ? (
        <div className={styles.chartCard}>
          <p className={styles.cardSubtitle}>No AI tutor activity in this period yet.</p>
        </div>
      ) : (
        <>
          <div className={styles.chartsGridTwo}>
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Daily AI Questions</h2>
                  <p className={styles.cardSubtitle}>Questions asked per day (IST)</p>
                </div>
              </div>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={daily} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aiDailyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} dy={8} minTickGap={16} />
                    <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="questions" stroke="#38BDF8" strokeWidth={3} fill="url(#aiDailyGradient)" name="Questions" />
                    <Area type="monotone" dataKey="students" stroke="#22C55E" strokeWidth={2} fill="none" name="Students" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>How Students Ask</h2>
                  <p className={styles.cardSubtitle}>Typed, voice and photo questions</p>
                </div>
              </div>
              <div className={styles.pieContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={modes} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {modes.map((m) => <Cell key={m.mode} fill={MODE_COLORS[m.mode]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.pieLegend}>
                  {modes.map((m) => (
                    <div key={m.mode} className={styles.pieLegendItem}>
                      <div className={styles.legendColorBox} style={{ backgroundColor: MODE_COLORS[m.mode] }} />
                      <span className={styles.legendLabel}>{m.name}</span>
                      <span className={styles.legendValue}>{Math.round((m.value / modeTotal) * 100)}% ({m.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartsGridTwo}>
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Questions by Class</h2>
                  <p className={styles.cardSubtitle}>Which classes use the AI tutor most</p>
                </div>
              </div>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={classes} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="questions" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Questions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Busiest Hours</h2>
                  <p className={styles.cardSubtitle}>Questions by hour of day (IST)</p>
                </div>
              </div>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={hours} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} dy={8} interval={3} />
                    <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="questions" fill="#EC4899" radius={[4, 4, 0, 0]} name="Questions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.chartsGridTwo}>
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Top Subjects</h2>
                  <p className={styles.cardSubtitle}>Questions per subject</p>
                </div>
              </div>
              <div className={styles.topList}>
                {data.subjects.map((s) => (
                  <div key={s.subject} className={styles.topItem}>
                    <div className={styles.courseInfo}>
                      <h4 className={styles.courseTitle}>{s.subject === 'General' ? 'Any subject' : s.subject}</h4>
                    </div>
                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>{s.questions} questions</span>
                        <span className={styles.scoreBadge}>{Math.round((s.questions / totals.questions) * 100)}%</span>
                      </div>
                      <div className={styles.progressBarBg}>
                        <div className={styles.progressBarFill} style={{ width: `${(s.questions / totals.questions) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Most-Asked Chapters & Topics</h2>
                  <p className={styles.cardSubtitle}>Where students need the most help (from "Ask AI" on chapter pages)</p>
                </div>
              </div>
              {data.topics.length === 0 ? (
                <p className={styles.cardSubtitle}>No chapter-specific questions yet.</p>
              ) : (
                <div className={styles.topList}>
                  {data.topics.map((t) => (
                    <div key={`${t.subject}-${t.topic}`} className={styles.topItem}>
                      <div className={styles.courseInfo}>
                        <h4 className={styles.courseTitle}>{t.topic}</h4>
                        <span className={styles.courseStudents}>{t.subject}</span>
                      </div>
                      <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                          <span className={styles.progressLabel}>{t.questions} questions</span>
                        </div>
                        <div className={styles.progressBarBg}>
                          <div className={styles.progressBarFill} style={{ width: `${(t.questions / maxTopic) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default AITutorInsights;
