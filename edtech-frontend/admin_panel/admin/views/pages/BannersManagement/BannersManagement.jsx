import React, { useState } from 'react';
import { 
  Search, 
  Image as ImageIcon, 
  Calendar, 
  Users, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import styles from './BannersManagement.module.css';

const initialBanners = [
  { 
    id: 'BNR001', 
    title: '2026 Fall Enrollment Open', 
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop', 
    targeting: 'Prospective Students', 
    scheduleType: 'Permanent',
    startDate: '',
    endDate: '',
    status: 'Active' 
  },
  { 
    id: 'BNR002', 
    title: 'Annual Faculty Symposium', 
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop', 
    targeting: 'Staff & Faculty', 
    scheduleType: 'Scheduled',
    startDate: '2026-11-12',
    endDate: '2026-11-18',
    status: 'Scheduled' 
  },
  { 
    id: 'BNR003', 
    title: 'National Scholarship Exam 2026', 
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop', 
    targeting: 'Existing Students', 
    scheduleType: 'Permanent',
    startDate: '',
    endDate: '',
    status: 'Active' 
  },
  { 
    id: 'BNR004', 
    title: 'Parents Orientation Session', 
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop', 
    targeting: 'Parents', 
    scheduleType: 'Scheduled',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    status: 'Inactive' 
  }
];

const BannersManagement = () => {
  const [banners, setBanners] = useState(initialBanners);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
    targeting: 'Prospective Students',
    scheduleType: 'Permanent',
    startDate: '',
    endDate: '',
    status: 'Active'
  });

  const toast = useToast();

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
      targeting: 'Prospective Students',
      scheduleType: 'Permanent',
      startDate: '',
      endDate: '',
      status: 'Active'
    });
  };

  // Helper to format date range
  const formatSchedule = (banner) => {
    if (banner.scheduleType === 'Permanent') return 'Permanent';
    if (!banner.startDate || !banner.endDate) return 'Permanent';
    const start = new Date(banner.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(banner.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // Filters
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = 
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.targeting.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTarget = selectedTarget === 'All' || banner.targeting === selectedTarget;
    const matchesStatus = selectedStatus === 'All' || banner.status === selectedStatus;

    return matchesSearch && matchesTarget && matchesStatus;
  });

  // Calculate statistics
  const totalCount = banners.length;
  const activeCount = banners.filter(b => b.status === 'Active').length;
  const scheduledCount = banners.filter(b => b.status === 'Scheduled').length;
  const inactiveCount = totalCount - activeCount - scheduledCount;

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add banner
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error('Title and Image URL are required fields.', 'Validation Error');
      return;
    }
    if (formData.scheduleType === 'Scheduled' && (!formData.startDate || !formData.endDate)) {
      toast.error('Start and End dates are required for Scheduled banners.', 'Validation Error');
      return;
    }

    const nextIdNum = Math.max(...banners.map(b => parseInt(b.id.replace('BNR', '')))) + 1;
    const formattedId = `BNR${String(nextIdNum).padStart(3, '0')}`;

    const newBanner = {
      id: formattedId,
      ...formData
    };

    setBanners(prev => [newBanner, ...prev]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success(`Banner "${newBanner.title}" has been successfully added.`, 'Banner Added');
  };

  // Edit banner
  const handleEditClick = (banner) => {
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      targeting: banner.targeting,
      scheduleType: banner.scheduleType,
      startDate: banner.startDate || '',
      endDate: banner.endDate || '',
      status: banner.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error('Title and Image URL are required fields.', 'Validation Error');
      return;
    }
    if (formData.scheduleType === 'Scheduled' && (!formData.startDate || !formData.endDate)) {
      toast.error('Start and End dates are required for Scheduled banners.', 'Validation Error');
      return;
    }

    setBanners(prev => 
      prev.map(b => b.id === currentBanner.id ? { ...b, ...formData } : b)
    );
    setIsEditModalOpen(false);
    resetForm();
    toast.success(`Banner details for "${formData.title}" updated.`, 'Banner Updated');
  };

  // Schedule modal
  const handleScheduleClick = (banner) => {
    setCurrentBanner(banner);
    setFormData({
      ...formData,
      scheduleType: banner.scheduleType,
      startDate: banner.startDate || '',
      endDate: banner.endDate || '',
      status: banner.status
    });
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (formData.scheduleType === 'Scheduled' && (!formData.startDate || !formData.endDate)) {
      toast.error('Start and End dates are required for Scheduled banners.', 'Validation Error');
      return;
    }

    setBanners(prev => 
      prev.map(b => b.id === currentBanner.id ? { 
        ...b, 
        scheduleType: formData.scheduleType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.scheduleType === 'Scheduled' ? 'Scheduled' : 'Active'
      } : b)
    );
    setIsScheduleModalOpen(false);
    toast.success(`Schedule updated for "${currentBanner.title}".`, 'Schedule Updated');
  };

  // Delete banner
  const handleDeleteClick = (banner) => {
    setCurrentBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setBanners(prev => prev.filter(b => b.id !== currentBanner.id));
    setIsDeleteModalOpen(false);
    toast.success(`Banner "${currentBanner.title}" has been deleted.`, 'Banner Removed');
    setCurrentBanner(null);
  };

  // View preview modal
  const handlePreviewClick = (banner) => {
    setCurrentBanner(banner);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Banner Management</h1>
          <p className={styles.subtitle}>Configure marketing announcements and updates targeted at specific student boards.</p>
        </div>
        <button 
          className={styles.primaryButton}
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
        >
          <Plus size={18} />
          <span>Add Banner</span>
        </button>
      </header>

      {/* Stats Cards */}
      <section className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#1B3A8C', backgroundColor: 'rgba(27, 58, 140, 0.08)' }}>
            <ImageIcon size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Banners</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active</span>
            <span className={styles.statValue}>{activeCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Scheduled</span>
            <span className={styles.statValue}>{scheduledCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Inactive</span>
            <span className={styles.statValue}>{inactiveCount}</span>
          </div>
        </div>
      </section>

      {/* Filter and List Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search banners by title or targeting..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.controlsContainer}>
            <select 
              className={styles.filterSelect}
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
            >
              <option value="All">All Audiences</option>
              <option value="Prospective Students">Prospective Students</option>
              <option value="Existing Students">Existing Students</option>
              <option value="Staff & Faculty">Staff & Faculty</option>
              <option value="Parents">Parents</option>
            </select>

            <select 
              className={styles.filterSelect}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className={styles.bannersList}>
          {filteredBanners.length > 0 ? (
            filteredBanners.map((banner) => (
              <div key={banner.id} className={styles.bannerCard}>
                <div className={styles.bannerImageContainer}>
                  <img src={banner.imageUrl} alt={banner.title} className={styles.bannerImage} />
                </div>
                
                <div className={styles.bannerInfo}>
                  <div className={styles.bannerHeader}>
                    <h3 className={styles.bannerTitle}>{banner.title}</h3>
                    <span className={`${styles.statusBadge} ${
                      banner.status === 'Active' ? styles.active :
                      banner.status === 'Scheduled' ? styles.scheduled : styles.inactive
                    }`}>
                      {banner.status}
                    </span>
                  </div>

                  <div className={styles.bannerMeta}>
                    <div className={styles.metaItem}>
                      <Users size={14} />
                      <span>Targeting: {banner.targeting}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Calendar size={14} />
                      <span>Schedule: {formatSchedule(banner)}</span>
                    </div>
                  </div>

                  <div className={styles.bannerActions}>
                    <button 
                      className={styles.actionTextButton}
                      onClick={() => handleEditClick(banner)}
                    >
                      <Edit2 size={12} />
                      <span>Replace</span>
                    </button>
                    <button 
                      className={styles.actionTextButton}
                      onClick={() => handleScheduleClick(banner)}
                    >
                      <Calendar size={12} />
                      <span>Schedule</span>
                    </button>
                  </div>
                </div>

                <div className={styles.sideControls}>
                  <button 
                    className={styles.iconButton} 
                    title="Preview Banner"
                    onClick={() => handlePreviewClick(banner)}
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    className={`${styles.iconButton} ${styles.danger}`} 
                    title="Delete Banner"
                    onClick={() => handleDeleteClick(banner)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
              No banners found matching the criteria.
            </div>
          )}
        </div>
      </div>

      {/* Add Banner Modal */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Banner</h2>
              <button className={styles.closeButton} onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Banner Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    placeholder="e.g. Winter Admissions Announcement"
                    className={styles.formInput}
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Image URL *</label>
                  <input 
                    type="url" 
                    name="imageUrl" 
                    required 
                    placeholder="Enter image URL..."
                    className={styles.formInput}
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>

                {formData.imageUrl && (
                  <div className={styles.previewContainer}>
                    <span className={styles.formLabel}>Image Preview</span>
                    <img src={formData.imageUrl} alt="Preview" className={styles.previewImage} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Target Audience *</label>
                    <select 
                      name="targeting"
                      className={styles.formSelect}
                      value={formData.targeting}
                      onChange={handleInputChange}
                    >
                      <option value="Prospective Students">Prospective Students</option>
                      <option value="Existing Students">Existing Students</option>
                      <option value="Staff & Faculty">Staff & Faculty</option>
                      <option value="Parents">Parents</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select 
                      name="status"
                      className={styles.formSelect}
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Schedule Type</label>
                  <select 
                    name="scheduleType"
                    className={styles.formSelect}
                    value={formData.scheduleType}
                    onChange={handleInputChange}
                  >
                    <option value="Permanent">Permanent (No end date)</option>
                    <option value="Scheduled">Scheduled (Specify dates)</option>
                  </select>
                </div>

                {formData.scheduleType === 'Scheduled' && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Start Date *</label>
                      <input 
                        type="date" 
                        name="startDate" 
                        required 
                        className={styles.formInput}
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>End Date *</label>
                      <input 
                        type="date" 
                        name="endDate" 
                        required 
                        className={styles.formInput}
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Replace Banner Configuration</h2>
              <button className={styles.closeButton} onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Banner Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    className={styles.formInput}
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Image URL *</label>
                  <input 
                    type="url" 
                    name="imageUrl" 
                    required 
                    className={styles.formInput}
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>

                {formData.imageUrl && (
                  <div className={styles.previewContainer}>
                    <span className={styles.formLabel}>Image Preview</span>
                    <img src={formData.imageUrl} alt="Preview" className={styles.previewImage} />
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Target Audience *</label>
                    <select 
                      name="targeting"
                      className={styles.formSelect}
                      value={formData.targeting}
                      onChange={handleInputChange}
                    >
                      <option value="Prospective Students">Prospective Students</option>
                      <option value="Existing Students">Existing Students</option>
                      <option value="Staff & Faculty">Staff & Faculty</option>
                      <option value="Parents">Parents</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select 
                      name="status"
                      className={styles.formSelect}
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Schedule Type</label>
                  <select 
                    name="scheduleType"
                    className={styles.formSelect}
                    value={formData.scheduleType}
                    onChange={handleInputChange}
                  >
                    <option value="Permanent">Permanent (No end date)</option>
                    <option value="Scheduled">Scheduled (Specify dates)</option>
                  </select>
                </div>

                {formData.scheduleType === 'Scheduled' && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Start Date *</label>
                      <input 
                        type="date" 
                        name="startDate" 
                        required 
                        className={styles.formInput}
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>End Date *</label>
                      <input 
                        type="date" 
                        name="endDate" 
                        required 
                        className={styles.formInput}
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Specific Modal */}
      {isScheduleModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Configure Banner Schedule</h2>
              <button className={styles.closeButton} onClick={() => setIsScheduleModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div className={styles.modalBody}>
                <p>Scheduling dates for: <strong>{currentBanner?.title}</strong></p>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Schedule Type</label>
                  <select 
                    name="scheduleType"
                    className={styles.formSelect}
                    value={formData.scheduleType}
                    onChange={handleInputChange}
                  >
                    <option value="Permanent">Permanent (Always Active)</option>
                    <option value="Scheduled">Scheduled Date Range</option>
                  </select>
                </div>

                {formData.scheduleType === 'Scheduled' && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Start Date *</label>
                      <input 
                        type="date" 
                        name="startDate" 
                        required 
                        className={styles.formInput}
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>End Date *</label>
                      <input 
                        type="date" 
                        name="endDate" 
                        required 
                        className={styles.formInput}
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: 'var(--color-error)' }}>Remove Banner</h2>
              <button className={styles.closeButton} onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete the banner <strong>{currentBanner?.title}</strong>?</p>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                This is a simulation. Deleting this banner will remove it from active lists until the session is reloaded.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className={styles.primaryButton} 
                style={{ backgroundColor: 'var(--color-error)' }}
                onClick={handleDeleteConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Preview Modal */}
      {isPreviewModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsPreviewModalOpen(false)}>
          <div className={styles.modal} style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Banner Preview</h2>
              <button className={styles.closeButton} onClick={() => setIsPreviewModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody} style={{ gap: 'var(--space-4)' }}>
              <div>
                <img 
                  src={currentBanner?.imageUrl} 
                  alt={currentBanner?.title} 
                  style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} 
                />
              </div>
              <h3 style={{ margin: 'var(--space-2) 0 0 0', fontFamily: 'var(--font-heading)' }}>{currentBanner?.title}</h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                Targeting Audience: <strong>{currentBanner?.targeting}</strong>
              </p>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                Schedule status: <strong>{currentBanner?.status}</strong> ({currentBanner ? formatSchedule(currentBanner) : ''})
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.primaryButton} onClick={() => setIsPreviewModalOpen(false)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersManagement;
