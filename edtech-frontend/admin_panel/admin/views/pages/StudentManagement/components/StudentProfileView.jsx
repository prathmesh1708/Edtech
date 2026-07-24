import React from 'react';
import { 
  ArrowLeft, Edit2, ShieldAlert, Key, Award, BookOpen, Clock, 
  CheckCircle, FileText, Activity, User, Phone, Mail, MapPin, 
  Calendar, Layers, CheckSquare, BarChart2, Star, Check
} from 'lucide-react';
import styles from '../StudentManagement.module.css';

const StudentProfileView = ({ 
  student, 
  onBack, 
  onEdit, 
  onOpenAccessControl,
  onSwitchTab 
}) => {
  if (!student) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // KPI Mock / Prop values
  const stats = {
    coursesEnrolled: student.coursesEnrolled || 6,
    assignmentsSubmitted: student.assignmentsSubmitted || 18,
    quizzesCompleted: student.quizzesCompleted || 24,
    averageScore: student.averageScore || 88.5,
    attendancePct: student.attendancePct || 94.2,
    studyHours: student.studyHours || 142,
    certificatesEarned: student.certificatesEarned || 4
  };

  return (
    <div className={styles.profileContainer}>
      {/* Top Banner & Header */}
      <div className={styles.profileHeaderCard}>
        <div className={styles.profileHeaderNav}>
          <button className={styles.backButton} onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Students List</span>
          </button>

          <div className={styles.profileQuickActions}>
            <button className={styles.secondaryButton} onClick={() => onSwitchTab('academic')}>
              <Award size={16} />
              <span>Academic Records</span>
            </button>
            <button className={styles.secondaryButton} onClick={() => onSwitchTab('activity')}>
              <Activity size={16} />
              <span>Activity Logs</span>
            </button>
            <button className={styles.secondaryButton} onClick={() => onEdit(student)}>
              <Edit2 size={16} />
              <span>Edit Profile</span>
            </button>
            <button className={styles.primaryButton} onClick={() => onOpenAccessControl('reset-password', student)}>
              <Key size={16} />
              <span>Reset Password</span>
            </button>
          </div>
        </div>

        <div className={styles.profileMainBanner}>
          <div className={styles.avatarLargeWrapper}>
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.name} className={styles.avatarLargeImg} />
            ) : (
              <div className={styles.avatarLargeFallback}>
                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            <span className={`${styles.statusDot} ${styles[student.status.toLowerCase()]}`} />
          </div>

          <div className={styles.profileTitleBlock}>
            <div className={styles.titleBadgeGroup}>
              <h1 className={styles.profileName}>{student.name}</h1>
              <span className={`${styles.statusBadge} ${styles[student.status.toLowerCase()]}`}>
                {student.status}
              </span>
              {student.emailVerified && (
                <span className={styles.verifiedBadge} title="Email Verified">
                  <Check size={12} /> Verified
                </span>
              )}
            </div>

            <p className={styles.profileSubMeta}>
              <span>ID: {student.displayId || student.studentId}</span>
              <span className={styles.metaDivider}>•</span>
              <span>Class: {student.grade || student.classId} ({student.section || 'Sec A'})</span>
              <span className={styles.metaDivider}>•</span>
              <span>Batch: {student.batch || '2025-2026'}</span>
              <span className={styles.metaDivider}>•</span>
              <span>Roll No: {student.rollNumber || '104'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 7 KPI Dashboard Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(79, 110, 247, 0.1)', color: '#4F6EF7' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{stats.coursesEnrolled}</div>
            <div className={styles.kpiLabel}>Courses Enrolled</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
            <FileText size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{stats.assignmentsSubmitted}</div>
            <div className={styles.kpiLabel}>Assignments Submitted</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{stats.quizzesCompleted}</div>
            <div className={styles.kpiLabel}>Quizzes Completed</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <BarChart2 size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{stats.averageScore}%</div>
            <div className={styles.kpiLabel}>Average Score</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0EA5E9' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{stats.attendancePct}%</div>
            <div className={styles.kpiLabel}>Attendance Rate</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{stats.studyHours}h</div>
            <div className={styles.kpiLabel}>Total Study Hours</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308' }}>
            <Award size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{stats.certificatesEarned}</div>
            <div className={styles.kpiLabel}>Certificates Earned</div>
          </div>
        </div>
      </div>

      {/* Information Grid Sections */}
      <div className={styles.detailsGrid}>
        {/* Personal Details */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <User size={18} className={styles.detailIcon} />
            <h2>Personal Information</h2>
          </div>
          <div className={styles.detailList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Full Name</span>
              <span className={styles.detailValue}>{student.name}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Date of Birth</span>
              <span className={styles.detailValue}>{formatDate(student.dob || '2008-05-15')}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Gender</span>
              <span className={styles.detailValue}>{student.gender || 'Male'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Address</span>
              <span className={styles.detailValue}>{student.address || '123 Academic Way, Education City'}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <Mail size={18} className={styles.detailIcon} />
            <h2>Contact Information</h2>
          </div>
          <div className={styles.detailList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Email Address</span>
              <span className={styles.detailValue}>{student.email || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Mobile Phone</span>
              <span className={styles.detailValue}>{student.phone || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Email Status</span>
              <span className={styles.detailValue}>
                {student.emailVerified ? (
                  <span className={styles.badgeSuccess}>Verified</span>
                ) : (
                  <button className={styles.badgeWarningBtn} onClick={() => onOpenAccessControl('verify-email', student)}>
                    Unverified - Verify Now
                  </button>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Details */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <User size={18} className={styles.detailIcon} />
            <h2>Parent / Guardian Details</h2>
          </div>
          <div className={styles.detailList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Guardian Name</span>
              <span className={styles.detailValue}>{student.parentName || 'Robert Smith'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Guardian Contact</span>
              <span className={styles.detailValue}>{student.parentPhone || '+1 (555) 987-6543'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Emergency Contact</span>
              <span className={styles.detailValue}>{student.parentPhone || '+1 (555) 987-6543'}</span>
            </div>
          </div>
        </div>

        {/* Academic & Enrollment Info */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <BookOpen size={18} className={styles.detailIcon} />
            <h2>Academic & Enrollment Info</h2>
          </div>
          <div className={styles.detailList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Class & Section</span>
              <span className={styles.detailValue}>{student.grade || student.classId} - Section {student.section || 'A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Roll Number</span>
              <span className={styles.detailValue}>{student.rollNumber || '104'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Education Board</span>
              <span className={styles.detailValue}>{student.board || 'CBSE'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Academic Session</span>
              <span className={styles.detailValue}>{student.batch || '2025-2026'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Admission Date</span>
              <span className={styles.detailValue}>{formatDate(student.joined)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;
