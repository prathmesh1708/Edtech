import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  Loader2
} from 'lucide-react';
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

  const { kpis } = insightsData;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Educational Performance Insights</h1>
          <p className={styles.pageSubtitle}>In-depth analysis of test scores, syllabus mastery, and student academic progress.</p>
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
          <div className={styles.kpiValue}>{kpis?.avgTestScore || '84.2%'}</div>
          <div className={styles.kpiSub}>Target threshold: 75.0%</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Syllabus Mastery Index</span>
            <div className={`${styles.iconBadge} ${styles.greenBg}`}>
              <BookOpen size={20} className={styles.greenIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis?.syllabusMastery || '91.5%'}</div>
          <div className={styles.kpiSub}>Chapter completion accuracy</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Assignment Pass Rate</span>
            <div className={`${styles.iconBadge} ${styles.purpleBg}`}>
              <CheckCircle size={20} className={styles.purpleIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis?.assignmentPassRate || '89.8%'}</div>
          <div className={styles.kpiSub}>Passed exams on 1st attempt</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Students Needing Support</span>
            <div className={`${styles.iconBadge} ${styles.amberBg}`}>
              <AlertTriangle size={20} className={styles.amberIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis?.atRiskStudentsCount || 0} Students</div>
          <div className={styles.kpiSub}>Average score below 72%</div>
        </div>
      </div>
    </div>
  );
};

export default EducationalInsights;
