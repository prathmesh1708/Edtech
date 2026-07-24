import React, { useState } from 'react';
import { X, ShieldAlert, Key, CheckCircle, AlertTriangle, UserCheck, RefreshCw, Copy, Check, Lock, BookOpen } from 'lucide-react';
import styles from '../StudentManagement.module.css';

const AccessControlModal = ({ 
  type, 
  isOpen, 
  onClose, 
  onConfirm, 
  student = null,
  isLoading = false 
}) => {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedClass, setSelectedClass] = useState(student?.classId || student?.grade || 'Class 10');
  const [selectedBatch, setSelectedBatch] = useState(student?.batch || '2025-2026');

  if (!isOpen || !student) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let newPass = '';
    for (let i = 0; i < 10; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
  };

  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAction = () => {
    if (type === 'reset-password') {
      onConfirm(password || 'Study123!');
    } else if (type === 'change-class-batch') {
      onConfirm({ classId: selectedClass, batch: selectedBatch });
    } else {
      onConfirm();
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'reset-password':
        return (
          <div className={styles.modalBody}>
            <div className={styles.accessIconContainer} style={{ background: 'rgba(26, 115, 232, 0.1)', color: '#1A73E8' }}>
              <Key size={32} />
            </div>
            <h3 className={styles.accessTitle}>Reset Password for {student.name}</h3>
            <p className={styles.accessDesc}>
              Generate a new temporary password or enter a custom one. The student will be prompted to change password upon next login.
            </p>
            <div className={styles.passwordGenBox}>
              <div className={styles.passwordInputWrap}>
                <input
                  type="text"
                  className={styles.formInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password or auto generate"
                />
                <button type="button" className={styles.secondaryButton} onClick={generateRandomPassword} style={{ padding: '6px 12px' }}>
                  <RefreshCw size={14} /> Generate
                </button>
              </div>
              {password && (
                <button type="button" className={styles.copyBtn} onClick={copyPassword}>
                  {copied ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Password'}</span>
                </button>
              )}
            </div>
          </div>
        );

      case 'suspend':
        return (
          <div className={styles.modalBody}>
            <div className={styles.accessIconContainer} style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308' }}>
              <AlertTriangle size={32} />
            </div>
            <h3 className={styles.accessTitle}>Suspend Student Account?</h3>
            <p className={styles.accessDesc}>
              Are you sure you want to suspend <strong>{student.name}</strong> ({student.studentId || student.displayId})? The student will temporarily lose portal access until unsuspended.
            </p>
          </div>
        );

      case 'block':
        return (
          <div className={styles.modalBody}>
            <div className={styles.accessIconContainer} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
              <Lock size={32} />
            </div>
            <h3 className={styles.accessTitle}>Block Student Login?</h3>
            <p className={styles.accessDesc}>
              This will immediately revoke active sessions and block <strong>{student.name}</strong> from logging into Study Wisely.
            </p>
          </div>
        );

      case 'activate':
        return (
          <div className={styles.modalBody}>
            <div className={styles.accessIconContainer} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
              <UserCheck size={32} />
            </div>
            <h3 className={styles.accessTitle}>Activate Account?</h3>
            <p className={styles.accessDesc}>
              Re-activate access for <strong>{student.name}</strong>. The student will be able to log in and resume coursework immediately.
            </p>
          </div>
        );

      case 'deactivate':
        return (
          <div className={styles.modalBody}>
            <div className={styles.accessIconContainer} style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748B' }}>
              <ShieldAlert size={32} />
            </div>
            <h3 className={styles.accessTitle}>Deactivate Account?</h3>
            <p className={styles.accessDesc}>
              Set account status for <strong>{student.name}</strong> to Inactive.
            </p>
          </div>
        );

      case 'verify-email':
        return (
          <div className={styles.modalBody}>
            <div className={styles.accessIconContainer} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
              <CheckCircle size={32} />
            </div>
            <h3 className={styles.accessTitle}>Verify Student Email</h3>
            <p className={styles.accessDesc}>
              Manually mark <strong>{student.email}</strong> as verified for <strong>{student.name}</strong>.
            </p>
          </div>
        );

      case 'change-class-batch':
        return (
          <div className={styles.modalBody}>
            <div className={styles.accessIconContainer} style={{ background: 'rgba(79, 110, 247, 0.1)', color: '#4F6EF7' }}>
              <BookOpen size={32} />
            </div>
            <h3 className={styles.accessTitle}>Change Class & Batch</h3>
            <p className={styles.accessDesc}>
              Transfer <strong>{student.name}</strong> to a different academic grade or session batch.
            </p>
            <div className={styles.formGroup} style={{ marginTop: '1rem', textAlign: 'left' }}>
              <label className={styles.formLabel}>New Class / Grade</label>
              <select className={styles.formSelect} value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '0.75rem', textAlign: 'left' }}>
              <label className={styles.formLabel}>Academic Batch</label>
              <select className={styles.formSelect} value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className={styles.modalBody}>
            <div className={styles.accessIconContainer} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
              <AlertTriangle size={32} />
            </div>
            <h3 className={styles.accessTitle}>Delete Student Permanent Record?</h3>
            <p className={styles.accessDesc}>
              This action cannot be undone. All activity history, quiz results, and profile records for <strong>{student.name}</strong> will be permanently purged.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const getActionButtonLabel = () => {
    switch (type) {
      case 'reset-password': return 'Confirm Password Reset';
      case 'suspend': return 'Suspend Student';
      case 'block': return 'Block Account';
      case 'activate': return 'Activate Account';
      case 'deactivate': return 'Deactivate Account';
      case 'verify-email': return 'Verify Email';
      case 'change-class-batch': return 'Update Enrollment';
      case 'delete': return 'Permanently Delete';
      default: return 'Confirm';
    }
  };

  const isDanger = type === 'delete' || type === 'block' || type === 'suspend';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div className={styles.modalHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <span></span>
          <button className={styles.closeButton} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {renderContent()}

        <div className={styles.modalFooter} style={{ justifyContent: 'center', gap: '10px' }}>
          <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button 
            type="button" 
            className={`${styles.primaryButton} ${isDanger ? styles.dangerButton : ''}`}
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : getActionButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessControlModal;
