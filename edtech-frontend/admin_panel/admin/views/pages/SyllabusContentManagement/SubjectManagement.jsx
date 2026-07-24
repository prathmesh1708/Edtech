import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import syllabusManagementService from '../../../../../src/models/services/syllabusManagementService';
import styles from './SyllabusContentManagement.module.css';

const SubjectManagement = () => {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    board: 'CBSE',
    classId: 'Class 10',
    description: '',
    color: '#1A73E8',
    status: 'Active'
  });

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const res = await syllabusManagementService.getSubjects();
      setSubjects(res.data || []);
    } catch (err) {
      toast.error('Failed to load subject directory.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAdd = () => {
    setCurrentItem(null);
    setFormData({
      subjectName: '',
      subjectCode: '',
      board: 'CBSE',
      classId: 'Class 10',
      description: '',
      color: '#1A73E8',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      subjectName: item.subjectName,
      subjectCode: item.subjectCode || '',
      board: item.board || 'CBSE',
      classId: item.classId || 'Class 10',
      description: item.description || '',
      color: item.color || '#1A73E8',
      status: item.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName.trim() || !formData.subjectCode.trim()) {
      toast.error('Subject Name and Code are required.', 'Validation Error');
      return;
    }

    setIsLoading(true);
    try {
      if (currentItem) {
        await syllabusManagementService.updateSubject(currentItem._id, formData);
        toast.success(`Subject "${formData.subjectName}" updated.`, 'Subject Updated');
      } else {
        await syllabusManagementService.createSubject(formData);
        toast.success(`Subject "${formData.subjectName}" created.`, 'Subject Created');
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error('Failed to save subject.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    setIsLoading(true);
    try {
      await syllabusManagementService.deleteSubject(currentItem._id);
      toast.success(`Subject "${currentItem.subjectName}" deleted.`, 'Deleted');
      setIsDeleteModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error('Failed to delete subject.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = subjects.filter(s => {
    const matchesSearch = s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBoard = selectedBoard === 'All' || 
                         s.board === selectedBoard || 
                         s.board.toLowerCase().includes(selectedBoard.toLowerCase()) ||
                         selectedBoard.toLowerCase().includes(s.board.toLowerCase());
    const matchesClass = selectedClass === 'All' || 
                         s.classId === selectedClass || 
                         s.classId.includes(selectedClass.replace('Class ', '')) ||
                         selectedClass.includes(s.classId.replace('Class ', ''));
    return matchesSearch && matchesBoard && matchesClass;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Subject Management</h1>
          <p className={styles.subtitle}>Configure subjects across different education boards and class levels.</p>
        </div>
        <button className={styles.primaryButton} onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Create New Subject</span>
        </button>
      </header>

      {/* KPI Overview */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(26, 115, 232, 0.1)', color: '#1A73E8' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{subjects.length}</div>
            <div className={styles.kpiLabel}>Total Subjects</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{subjects.filter(s => s.status === 'Active').length}</div>
            <div className={styles.kpiLabel}>Active Subjects</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
            <Layers size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>CBSE / ICSE / IB</div>
            <div className={styles.kpiLabel}>Supported Boards</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search subject name or code..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.controlsContainer}>
            <select 
              className={styles.filterSelect}
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
            >
              <option value="All">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="IB">IB</option>
              <option value="Cambridge">Cambridge</option>
            </select>

            <select 
              className={styles.filterSelect}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="All">All Classes</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Subject Code</th>
                <th>Board</th>
                <th>Class</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading subject directory...</td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item._id}>
                    <td className={styles.cellName}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color || '#1A73E8' }} />
                        <span>{item.subjectName}</span>
                      </div>
                    </td>
                    <td><span className={styles.versionTag}>{item.subjectCode}</span></td>
                    <td>{item.board}</td>
                    <td>{item.classId}</td>
                    <td>{item.description || 'N/A'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[(item.status || 'active').toLowerCase()]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                        <button className={styles.iconButton} onClick={() => handleOpenEdit(item)} title="Edit Subject">
                          <Edit2 size={14} />
                        </button>
                        <button className={`${styles.iconButton} ${styles.danger}`} onClick={() => { setCurrentItem(item); setIsDeleteModalOpen(true); }} title="Delete Subject">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-tertiary)' }}>
                    No subjects found.
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
              <h2 className={styles.modalTitle}>{currentItem ? 'Edit Subject' : 'Create New Subject'}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject Name *</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.subjectName}
                      onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                      placeholder="e.g. Mathematics"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject Code *</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.subjectCode}
                      onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                      placeholder="e.g. MATH-101"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Education Board</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.board}
                      onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                      <option value="IB">IB</option>
                      <option value="Cambridge">Cambridge</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Class / Grade</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    >
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Badge Accent Color</label>
                    <input 
                      type="color"
                      className={styles.formInput}
                      style={{ height: '38px', cursor: 'pointer' }}
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea 
                    rows={3}
                    className={styles.formTextarea}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Subject curriculum description..."
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{currentItem ? 'Update Subject' : 'Save Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className={styles.modalBody}>
              <h3 className={styles.modalTitle}>Delete Subject?</h3>
              <p className={styles.subtitle} style={{ marginTop: '8px' }}>
                Are you sure you want to delete <strong>{currentItem?.subjectName}</strong>?
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center' }}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button type="button" className={`${styles.primaryButton} ${styles.dangerButton}`} onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
