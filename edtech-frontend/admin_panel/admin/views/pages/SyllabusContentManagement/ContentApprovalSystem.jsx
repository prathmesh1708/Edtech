import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Clock, FileText, User, MessageSquare, History, Check, Eye } from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import syllabusManagementService from '../../../../../src/models/services/syllabusManagementService';
import styles from './SyllabusContentManagement.module.css';

const ContentApprovalSystem = () => {
  const toast = useToast();
  const [approvals, setApprovals] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Review & History Modals
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    reviewComments: ''
  });

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await syllabusManagementService.getContentApprovals();
      setApprovals(res.data?.list || []);
      setPendingCount(res.data?.pendingCount || 0);
    } catch (err) {
      toast.error('Failed to load content approval queue.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleOpenReview = (item, defaultStatus = 'Approved') => {
    setCurrentItem(item);
    setReviewForm({
      status: defaultStatus,
      reviewComments: item.reviewComments || ''
    });
    setIsReviewModalOpen(true);
  };

  const handleOpenHistory = (item) => {
    setCurrentItem(item);
    setIsHistoryModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentItem) return;

    setIsLoading(true);
    try {
      await syllabusManagementService.updateApprovalStatus(currentItem._id, {
        status: reviewForm.status,
        reviewComments: reviewForm.reviewComments,
        reviewer: 'Master Admin'
      });

      toast.success(`Content approval status updated to "${reviewForm.status}".`, 'Approval Workflow Updated');
      setIsReviewModalOpen(false);
      fetchApprovals();
    } catch (err) {
      toast.error('Failed to update approval status.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = approvals.filter(item => {
    const matchesSearch = item.materialTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.submittedBy && item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Content Approval System</h1>
          <p className={styles.subtitle}>Reviewer workflow, quality assurance, remarks, and approval audit history.</p>
        </div>
      </header>

      {/* KPI Dashboard Banner */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{pendingCount} Items</div>
            <div className={styles.kpiLabel}>Pending Review Count</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{approvals.filter(a => a.status === 'Approved').length}</div>
            <div className={styles.kpiLabel}>Approved Materials</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{approvals.filter(a => a.status === 'Changes Requested').length}</div>
            <div className={styles.kpiLabel}>Changes Requested</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
            <XCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{approvals.filter(a => a.status === 'Rejected').length}</div>
            <div className={styles.kpiLabel}>Rejected Submissions</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search by title, subject, or author..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.controlsContainer}>
            <select 
              className={styles.filterSelect}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Changes Requested">Changes Requested</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Material Title</th>
                <th>Type</th>
                <th>Subject & Board</th>
                <th>Submitted By</th>
                <th>Review Remarks</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Reviewer Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading approval queue...</td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item._id}>
                    <td className={styles.cellName}>{item.materialTitle}</td>
                    <td><span className={styles.typeTag}>{item.materialType}</span></td>
                    <td>{item.subject} ({item.board} - {item.classId})</td>
                    <td>{item.submittedBy || 'Content Contributor'}</td>
                    <td>{item.reviewComments || 'No remarks provided'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[item.status.toLowerCase().replace(' ', '')]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className={styles.primaryButton} 
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => handleOpenReview(item, 'Approved')}
                        >
                          <Check size={14} /> Review
                        </button>
                        <button 
                          className={styles.iconButton} 
                          onClick={() => handleOpenHistory(item)} 
                          title="View Approval History Log"
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-tertiary)' }}>
                    No pending or processed approval requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Action Modal */}
      {isReviewModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Content Review Workflow</h2>
              <button className={styles.closeButton} onClick={() => setIsReviewModalOpen(false)}><XCircle size={18} /></button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className={styles.modalBody}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{currentItem?.materialTitle}</h4>
                  <p className={styles.subtitle}>{currentItem?.subject} • {currentItem?.board} ({currentItem?.classId})</p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Decision Outcome</label>
                  <select 
                    className={styles.formSelect}
                    value={reviewForm.status}
                    onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                  >
                    <option value="Approved">Approve Content</option>
                    <option value="Changes Requested">Request Changes / Revision</option>
                    <option value="Rejected">Reject Submission</option>
                    <option value="Pending Review">Mark Pending</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Reviewer Comments & Feedback *</label>
                  <textarea 
                    rows={4}
                    className={styles.formTextarea}
                    value={reviewForm.reviewComments}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewComments: e.target.value })}
                    placeholder="Provide detailed feedback or revision notes..."
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsReviewModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>Submit Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Audit History Modal */}
      {isHistoryModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Approval Audit Log History</h2>
              <button className={styles.closeButton} onClick={() => setIsHistoryModalOpen(false)}><XCircle size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <h4 style={{ margin: '0 0 12px 0' }}>{currentItem?.materialTitle}</h4>
              
              <div className={styles.historyList}>
                {currentItem?.history && currentItem.history.length > 0 ? (
                  currentItem.history.map((log, idx) => (
                    <div key={idx} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <span>Status: <strong>{log.status}</strong> by {log.reviewer}</span>
                        <span>{new Date(log.date).toLocaleString()}</span>
                      </div>
                      <div className={styles.historyRemarks}>"{log.remarks || 'No remarks provided'}"</div>
                    </div>
                  ))
                ) : (
                  <p className={styles.subtitle}>No history entries recorded yet.</p>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsHistoryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentApprovalSystem;
