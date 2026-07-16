import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Search, 
  Users, 
  Layers, 
  MessageSquare,
  X
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import styles from './NotificationManagement.module.css';

const initialLogs = [
  { id: 'NTF001', title: 'System Maintenance Scheduled', message: 'The study platform will undergo scheduled maintenance this Sunday from 2 AM to 4 AM IST. Live classes will not be available.', target: 'All Users', category: 'Warning', time: '10 mins ago' },
  { id: 'NTF002', title: 'Mathematics Exam Postponed', message: 'The mock test for Mathematics Class 10 scheduled for tomorrow has been rescheduled to Friday at 10 AM.', target: 'Students', category: 'Reminder', time: '2 hours ago' },
  { id: 'NTF003', title: 'New Physics Study Material Uploaded', message: 'Chapter 5 Lecture Notes on Electrostatics are now available in the Syllabus & Content portal.', target: 'Students', category: 'Syllabus Update', time: '1 day ago' },
  { id: 'NTF004', title: 'Faculty Meet Reminder', message: 'Please attend the monthly alignment meeting today at 4:00 PM in Seminar Hall B.', target: 'Teachers', category: 'Announcement', time: '2 days ago' },
];

const NotificationManagement = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'All Users',
    category: 'Announcement'
  });

  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit new notification
  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message body are required.', 'Validation Error');
      return;
    }

    const nextIdNum = Math.max(...logs.map(l => parseInt(l.id.replace('NTF', '')) || 0), 0) + 1;
    const formattedId = `NTF${String(nextIdNum).padStart(3, '0')}`;

    const newLog = {
      id: formattedId,
      title: formData.title,
      message: formData.message,
      target: formData.target,
      category: formData.category,
      time: 'Just now'
    };

    setLogs(prev => [newLog, ...prev]);
    setFormData({
      title: '',
      message: '',
      target: 'All Users',
      category: 'Announcement'
    });
    toast.success(`Announcement "${newLog.title}" sent successfully.`, 'Notification Dispatched');
  };

  // Delete Log
  const handleDeleteLog = (id, title) => {
    setLogs(prev => prev.filter(l => l.id !== id));
    toast.success(`Log record for "${title}" has been deleted.`, 'Log Removed');
  };

  // Resend / copy back to form
  const handleResendClick = (log) => {
    setFormData({
      title: log.title,
      message: log.message,
      target: log.target,
      category: log.category
    });
    toast.info(`Notification details copied to compose form.`, 'Ready to Re-send');
  };

  // Preview notification
  const handlePreviewClick = (log) => {
    setSelectedNotification(log);
    setIsPreviewOpen(true);
  };

  // Filters search
  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const sentCount = logs.length;
  const targetGroupsCount = new Set(logs.map(l => l.target)).size;
  const criticalAlertsCount = logs.filter(l => l.category === 'Warning').length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Notification Portal</h1>
          <p className={styles.subtitle}>Broadcast announcements, system alerts, and class updates to the platform.</p>
        </div>
      </header>

      {/* Stats Cards */}
      <section className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#1B3A8C', backgroundColor: 'rgba(27, 58, 140, 0.08)' }}>
            <Bell size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Sent Broadcasts</span>
            <span className={styles.statValue}>{sentCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Targets</span>
            <span className={styles.statValue}>{targetGroupsCount} Groups</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
            <MessageSquare size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Critical Warnings</span>
            <span className={styles.statValue}>{criticalAlertsCount} Alerts</span>
          </div>
        </div>
      </section>

      <div className={styles.layout}>
        {/* Left pane: Compose Form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Compose Announcement</h2>
          <p className={styles.cardSubtitle}>Draft a new system notification or broadcast message.</p>

          <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notification Title *</label>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="e.g. Schedule Update / Live Session"
                className={styles.formInput}
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Broadcast Target *</label>
              <select 
                name="target" 
                className={styles.formSelect}
                value={formData.target}
                onChange={handleInputChange}
              >
                <option value="All Users">All Users (Global)</option>
                <option value="Students">Students Only</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Parents">Parents Only</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category / Intent</label>
              <select 
                name="category" 
                className={styles.formSelect}
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="Announcement">Announcement</option>
                <option value="Reminder">Reminder</option>
                <option value="Warning">Warning (Urgent Alert)</option>
                <option value="Syllabus Update">Syllabus Update</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Message Body *</label>
              <textarea 
                name="message" 
                required 
                placeholder="Write your detailed announcement message here..."
                className={styles.formTextarea}
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className={styles.primaryButton}>
              <Send size={16} />
              <span>Broadcast Announcement</span>
            </button>
          </form>
        </div>

        {/* Right pane: Log list */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Broadcast History</h2>
              <p className={styles.cardSubtitle}>List of dispatched messages and status reports.</p>
            </div>
            <div className={styles.searchContainer}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search history logs..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title & Info</th>
                  <th>Target Group</th>
                  <th>Type</th>
                  <th>Dispatched</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--color-text-tertiary)', fontWeight: 'var(--font-medium)' }}>{log.id}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles.cellTitle}>{log.title}</span>
                          <span className={styles.cellMessage}>{log.message}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: '#1B3A8C', backgroundColor: 'rgba(27, 58, 140, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          {log.target}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          log.category === 'Announcement' ? styles.announcement :
                          log.category === 'Reminder' ? styles.reminder :
                          log.category === 'Warning' ? styles.warning : styles.syllabus
                        }`}>
                          {log.category}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{log.time}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.iconButton} 
                            title="Preview Content"
                            onClick={() => handlePreviewClick(log)}
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className={styles.iconButton} 
                            title="Copy to Composer"
                            onClick={() => handleResendClick(log)}
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button 
                            className={`${styles.iconButton} ${styles.danger}`} 
                            title="Delete Log"
                            onClick={() => handleDeleteLog(log.id, log.title)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-tertiary)' }}>
                      No history records found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && selectedNotification && (
        <div className={styles.modalOverlay} onClick={() => setIsPreviewOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Broadcast Details</h2>
              <button className={styles.closeButton} onClick={() => setIsPreviewOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.previewField}>
                <span className={styles.previewLabel}>Notification ID</span>
                <span className={styles.previewValue}>{selectedNotification.id}</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewLabel}>Target Audience</span>
                <span className={styles.previewValue}>{selectedNotification.target}</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewLabel}>Category</span>
                <span className={styles.previewValue}>{selectedNotification.category}</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewLabel}>Subject / Title</span>
                <span className={styles.previewValue} style={{ fontWeight: 'var(--font-semibold)' }}>{selectedNotification.title}</span>
              </div>
              <div className={styles.previewField}>
                <span className={styles.previewLabel}>Message Content</span>
                <span className={styles.previewValue} style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-md)', lineHeight: '1.4' }}>{selectedNotification.message}</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.primaryButton} onClick={() => setIsPreviewOpen(false)} style={{ marginTop: 0 }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;
