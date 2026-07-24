import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Clock, BookOpen, Layers, CheckCircle, ListOrdered } from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import syllabusManagementService from '../../../../../src/models/services/syllabusManagementService';
import styles from './SyllabusContentManagement.module.css';

const ChapterManagement = () => {
  const toast = useToast();
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedBoard, setSelectedBoard] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [formData, setFormData] = useState({
    chapterName: '',
    chapterNumber: 1,
    subject: 'Mathematics',
    board: 'CBSE',
    classId: 'Class 10',
    description: '',
    learningObjectives: '',
    estimatedStudyTime: '4 Hours',
    orderIndex: 1,
    status: 'Active'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [chRes, subRes] = await Promise.all([
        syllabusManagementService.getChapters(),
        syllabusManagementService.getSubjects()
      ]);
      setChapters(chRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      toast.error('Failed to load chapter directory.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setCurrentItem(null);
    setFormData({
      chapterName: '',
      chapterNumber: chapters.length + 1,
      subject: subjects[0]?.subjectName || 'Mathematics',
      board: 'CBSE',
      classId: 'Class 10',
      description: '',
      learningObjectives: '',
      estimatedStudyTime: '4 Hours',
      orderIndex: chapters.length + 1,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      chapterName: item.chapterName,
      chapterNumber: item.chapterNumber || 1,
      subject: item.subject || 'Mathematics',
      board: item.board || 'CBSE',
      classId: item.classId || 'Class 10',
      description: item.description || '',
      learningObjectives: item.learningObjectives || '',
      estimatedStudyTime: item.estimatedStudyTime || '4 Hours',
      orderIndex: item.orderIndex || 1,
      status: item.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.chapterName.trim()) {
      toast.error('Chapter Name is required.', 'Validation Error');
      return;
    }

    setIsLoading(true);
    try {
      if (currentItem) {
        await syllabusManagementService.updateChapter(currentItem._id, formData);
        toast.success(`Chapter "${formData.chapterName}" updated.`, 'Chapter Updated');
      } else {
        await syllabusManagementService.createChapter(formData);
        toast.success(`Chapter "${formData.chapterName}" created.`, 'Chapter Created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save chapter.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    setIsLoading(true);
    try {
      await syllabusManagementService.deleteChapter(currentItem._id);
      toast.success(`Chapter "${currentItem.chapterName}" deleted.`, 'Deleted');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete chapter.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = chapters.filter(c => {
    const matchesSearch = c.chapterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || c.subject === selectedSubject;
    const matchesBoard = selectedBoard === 'All' || c.board === selectedBoard;
    return matchesSearch && matchesSubject && matchesBoard;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Chapter Management</h1>
          <p className={styles.subtitle}>Organize learning chapters, study time estimates, and learning objectives.</p>
        </div>
        <button className={styles.primaryButton} onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Chapter</span>
        </button>
      </header>

      {/* Overview Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(26, 115, 232, 0.1)', color: '#1A73E8' }}>
            <ListOrdered size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{chapters.length}</div>
            <div className={styles.kpiLabel}>Total Chapters</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{chapters.filter(c => c.status === 'Active').length}</div>
            <div className={styles.kpiLabel}>Active Chapters</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>4.5 Hours</div>
            <div className={styles.kpiLabel}>Avg Study Time</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search chapter name or objectives..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.controlsContainer}>
            <select 
              className={styles.filterSelect}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="All">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English Literature">English Literature</option>
            </select>

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
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Chapter # & Name</th>
                <th>Subject</th>
                <th>Board / Class</th>
                <th>Est. Study Time</th>
                <th>Learning Objectives</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading chapter directory...</td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item._id}>
                    <td className={styles.cellName}>
                      <div>Ch {item.chapterNumber}: {item.chapterName}</div>
                      <div className={styles.subText}>{item.description || 'No description'}</div>
                    </td>
                    <td><span className={styles.typeTag}>{item.subject}</span></td>
                    <td>{item.board} ({item.classId})</td>
                    <td>{item.estimatedStudyTime || '4 Hours'}</td>
                    <td>{item.learningObjectives || 'Standard Core Concept Objectives'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[(item.status || 'active').toLowerCase()]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                        <button className={styles.iconButton} onClick={() => handleOpenEdit(item)} title="Edit Chapter">
                          <Edit2 size={14} />
                        </button>
                        <button className={`${styles.iconButton} ${styles.danger}`} onClick={() => { setCurrentItem(item); setIsDeleteModalOpen(true); }} title="Delete Chapter">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-tertiary)' }}>
                    No chapters found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Chapter Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.largeModal}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{currentItem ? 'Edit Chapter' : 'Add New Chapter'}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Chapter Title *</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.chapterName}
                      onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                      placeholder="e.g. Real Numbers"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Chapter Number</label>
                    <input 
                      type="number"
                      className={styles.formInput}
                      value={formData.chapterNumber}
                      onChange={(e) => setFormData({ ...formData, chapterNumber: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English Literature">English Literature</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Board & Class</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className={styles.formSelect}
                        value={formData.board}
                        onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                        <option value="IB">IB</option>
                      </select>
                      <select 
                        className={styles.formSelect}
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      >
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Estimated Study Time</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.estimatedStudyTime}
                      onChange={(e) => setFormData({ ...formData, estimatedStudyTime: e.target.value })}
                      placeholder="e.g. 4 Hours"
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
                  <label className={styles.formLabel}>Learning Objectives</label>
                  <input 
                    type="text"
                    className={styles.formInput}
                    value={formData.learningObjectives}
                    onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                    placeholder="Key concepts & learning outcomes..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chapter Description</label>
                  <textarea 
                    rows={3}
                    className={styles.formTextarea}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{currentItem ? 'Update Chapter' : 'Save Chapter'}</button>
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
              <h3 className={styles.modalTitle}>Delete Chapter?</h3>
              <p className={styles.subtitle} style={{ marginTop: '8px' }}>
                Are you sure you want to delete <strong>{currentItem?.chapterName}</strong>?
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

export default ChapterManagement;
