import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, BookOpen, CheckCircle, Archive, Globe } from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import syllabusManagementService from '../../../../../src/models/services/syllabusManagementService';
import styles from './SyllabusContentManagement.module.css';

import SyllabusManagement from '../../../../../src/views/pages/admin/SyllabusManagement/SyllabusManagement';

const GlobalSyllabusManagement = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'subjects'
  const [syllabuses, setSyllabuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    academicYear: '2025-2026',
    description: '',
    status: 'Published',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const fetchSyllabuses = async () => {
    setIsLoading(true);
    try {
      const res = await syllabusManagementService.getGlobalSyllabuses();
      setSyllabuses(res.data || []);
    } catch (err) {
      toast.error('Failed to load global syllabus records from server.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabuses();
  }, []);

  const handleOpenAdd = () => {
    setCurrentItem(null);
    setFormData({
      name: '',
      academicYear: '2025-2026',
      description: '',
      status: 'Published',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      academicYear: item.academicYear || '2025-2026',
      description: item.description || '',
      status: item.status || 'Published',
      effectiveDate: item.effectiveDate ? item.effectiveDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Syllabus Name is required.', 'Validation Error');
      return;
    }

    setIsLoading(true);
    try {
      if (currentItem) {
        await syllabusManagementService.updateGlobalSyllabus(currentItem._id, formData);
        toast.success(`Syllabus "${formData.name}" updated successfully.`, 'Syllabus Updated');
      } else {
        await syllabusManagementService.createGlobalSyllabus(formData);
        toast.success(`Master Syllabus "${formData.name}" created successfully.`, 'Syllabus Created');
      }
      setIsModalOpen(false);
      fetchSyllabuses();
    } catch (err) {
      toast.error('Failed to save master syllabus record.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    setIsLoading(true);
    try {
      await syllabusManagementService.deleteGlobalSyllabus(currentItem._id);
      toast.success(`Syllabus "${currentItem.name}" archived successfully.`, 'Archived');
      setIsDeleteModalOpen(false);
      fetchSyllabuses();
    } catch (err) {
      toast.error('Failed to delete syllabus record.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = syllabuses.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Syllabus & Content Management</h1>
          <p className={styles.subtitle}>Define master frameworks, assign subjects, build chapters & manage learning content dynamically.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--color-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <button 
              type="button" 
              onClick={() => setActiveTab('global')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'global' ? '#1A73E8' : 'transparent',
                color: activeTab === 'global' ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Master Frameworks
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('subjects')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'subjects' ? '#1A73E8' : 'transparent',
                color: activeTab === 'subjects' ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Subject & Chapter Syllabus
            </button>
          </div>
          {activeTab === 'global' && (
            <button className={styles.primaryButton} onClick={handleOpenAdd}>
              <Plus size={16} />
              <span>Create Master Syllabus</span>
            </button>
          )}
        </div>
      </header>

      {activeTab === 'subjects' ? (
        <SyllabusManagement />
      ) : (
        <>

      {/* KPI Overview */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(26, 115, 232, 0.1)', color: '#1A73E8' }}>
            <Globe size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{syllabuses.length}</div>
            <div className={styles.kpiLabel}>Total Master Syllabuses</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{syllabuses.filter(s => s.status === 'Published').length}</div>
            <div className={styles.kpiLabel}>Active Published</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{syllabuses.filter(s => s.status === 'Draft').length}</div>
            <div className={styles.kpiLabel}>Draft Syllabuses</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search syllabus name or description..."
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
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Syllabus Name</th>
                <th>Academic Session</th>
                <th>Description</th>
                <th>Effective Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading syllabus frameworks...</td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item._id}>
                    <td className={styles.cellName}>{item.name}</td>
                    <td><span className={styles.versionTag}>{item.academicYear}</span></td>
                    <td>{item.description || 'N/A'}</td>
                    <td>{item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[(item.status || 'draft').toLowerCase()]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                        <button className={styles.iconButton} onClick={() => handleOpenEdit(item)} title="Edit Syllabus">
                          <Edit2 size={14} />
                        </button>
                        <button className={`${styles.iconButton} ${styles.danger}`} onClick={() => { setCurrentItem(item); setIsDeleteModalOpen(true); }} title="Archive Syllabus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-tertiary)' }}>
                    No syllabus records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{currentItem ? 'Edit Master Syllabus' : 'Create Master Syllabus'}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Syllabus Framework Name *</label>
                  <input 
                    type="text"
                    className={styles.formInput}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. CBSE Master Syllabus 2025-2026"
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Academic Session</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    >
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Effective Start Date</label>
                  <input 
                    type="date"
                    className={styles.formInput}
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea 
                    rows={3}
                    className={styles.formTextarea}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Syllabus overview and guidelines..."
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{currentItem ? 'Update Syllabus' : 'Save Syllabus'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className={styles.modalBody}>
              <h3 className={styles.modalTitle}>Archive Master Syllabus?</h3>
              <p className={styles.subtitle} style={{ marginTop: '8px' }}>
                Are you sure you want to archive <strong>{currentItem?.name}</strong>?
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center' }}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button type="button" className={`${styles.primaryButton} ${styles.dangerButton}`} onClick={handleDeleteConfirm}>Archive</button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default GlobalSyllabusManagement;
