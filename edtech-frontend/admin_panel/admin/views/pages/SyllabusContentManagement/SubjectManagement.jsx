import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import syllabusManagementService from '../../../../../src/models/services/syllabusManagementService';
import { BOARDS, STATE_BOARDS } from '../../../../../src/config/constants';
import styles from './SyllabusContentManagement.module.css';

const SubjectManagement = () => {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [registeredBoards, setRegisteredBoards] = useState([]);
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
    board: 'MP Board',
    classId: 'Class 10',
    price: '',
    quarterlyDiscount: '10',
    yearlyDiscount: '20',
    description: '',
    color: '#1A73E8',
    status: 'Active'
  });

  const fetchSubjectsAndBoards = async () => {
    setIsLoading(true);
    try {
      const [subjRes, boardsRes] = await Promise.all([
        syllabusManagementService.getSubjects(),
        syllabusManagementService.getBoards().catch(() => ({ data: [] }))
      ]);
      setSubjects(subjRes.data || []);
      setRegisteredBoards(boardsRes.data || []);
    } catch (err) {
      toast.error('Failed to load subject directory.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectsAndBoards();
  }, []);

  // Compute all available boards (standard + state boards + database registered)
  const allBoardOptions = React.useMemo(() => {
    const list = [
      { name: 'CBSE', type: 'National' },
      { name: 'ICSE', type: 'National' },
      { name: 'IB', type: 'International' },
      { name: 'Cambridge', type: 'International' },
    ];

    // Add STATE_BOARDS
    STATE_BOARDS.forEach(sb => {
      if (!list.some(b => b.name.toLowerCase() === sb.name.toLowerCase())) {
        list.push({ name: sb.name, state: sb.state, type: 'State Board' });
      }
    });

    // Add registered boards from backend DB
    registeredBoards.forEach(rb => {
      if (!list.some(b => b.name.toLowerCase() === rb.boardName.toLowerCase())) {
        list.push({
          name: rb.boardName,
          state: rb.stateName || '',
          type: rb.boardType || (rb.stateName ? 'State Board' : 'Custom')
        });
      }
    });

    return list;
  }, [registeredBoards]);

  const handleOpenAdd = () => {
    setCurrentItem(null);
    setFormData({
      subjectName: '',
      subjectCode: '',
      board: 'MP Board',
      classId: 'Class 10',
      price: '',
      quarterlyDiscount: '10',
      yearlyDiscount: '20',
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
      price: item.price !== undefined && item.price !== null ? item.price : '',
      quarterlyDiscount: item.quarterlyDiscount !== undefined && item.quarterlyDiscount !== null ? item.quarterlyDiscount : '10',
      yearlyDiscount: item.yearlyDiscount !== undefined && item.yearlyDiscount !== null ? item.yearlyDiscount : '20',
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
      fetchSubjectsAndBoards();
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
      fetchSubjectsAndBoards();
    } catch (err) {
      toast.error('Failed to delete subject.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = subjects.filter(s => {
    const matchesSearch = (s.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.subjectCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesBoard = selectedBoard === 'All';
    if (!matchesBoard) {
      const sBoard = String(s.board || '').toLowerCase();
      const selBoard = String(selectedBoard).toLowerCase();
      if (sBoard === selBoard || sBoard.includes(selBoard) || selBoard.includes(sBoard)) {
        matchesBoard = true;
      }
    }
    
    let matchesClass = selectedClass === 'All';
    if (!matchesClass && s.classId) {
      const sClassStr = String(s.classId).trim();
      const selClassStr = String(selectedClass).trim();
      if (sClassStr.toLowerCase() === selClassStr.toLowerCase()) {
        matchesClass = true;
      } else {
        const sDigits = sClassStr.replace(/\D/g, '');
        const selDigits = selClassStr.replace(/\D/g, '');
        if (sDigits && selDigits) {
          matchesClass = (sDigits === selDigits);
        }
      }
    }

    return matchesSearch && matchesBoard && matchesClass;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Subject Management</h1>
          <p className={styles.subtitle}>Configure subjects across State Boards (UP, MP, Maharashtra, Bihar, etc.) and National Boards.</p>
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
            <div className={styles.kpiValue}>{allBoardOptions.length} Boards</div>
            <div className={styles.kpiLabel}>State & National Boards</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search subject name, code, or board..."
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
              <option value="All">All Education Boards</option>
              <optgroup label="State Boards">
                {allBoardOptions.filter(b => b.type === 'State Board').map(b => (
                  <option key={b.name} value={b.name}>{b.name} {b.state ? `(${b.state})` : ''}</option>
                ))}
              </optgroup>
              <optgroup label="National & International">
                {allBoardOptions.filter(b => b.type !== 'State Board').map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </optgroup>
            </select>

            <select 
              className={styles.filterSelect}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="All">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
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
                <th>Monthly Price</th>
                <th>Quarterly Rate</th>
                <th>Yearly Rate</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>Loading subject directory...</td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const mPrice = item.price || 0;
                  const qDisc = item.quarterlyDiscount !== undefined ? item.quarterlyDiscount : 10;
                  const yDisc = item.yearlyDiscount !== undefined ? item.yearlyDiscount : 20;
                  const qPrice = Math.round(mPrice * 3 * (1 - qDisc / 100));
                  const yPrice = Math.round(mPrice * 12 * (1 - yDisc / 100));
                  const isStateBoard = String(item.board).toLowerCase().includes('board') && !['CBSE', 'ICSE', 'IB', 'Cambridge'].includes(item.board) || String(item.board).toLowerCase().includes('state');

                  return (
                    <tr key={item._id}>
                      <td className={styles.cellName}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color || '#1A73E8' }} />
                          <span style={{ fontWeight: '600' }}>{item.subjectName}</span>
                        </div>
                      </td>
                      <td><span className={styles.versionTag}>{item.subjectCode}</span></td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex',
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          background: isStateBoard ? 'rgba(245, 158, 11, 0.12)' : 'rgba(79, 110, 247, 0.12)',
                          color: isStateBoard ? '#D97706' : '#4F6EF7'
                        }}>
                          {item.board}
                        </span>
                      </td>
                      <td>{item.classId}</td>
                      <td><strong style={{ color: mPrice ? 'var(--color-primary, #1A73E8)' : '#64748B' }}>{mPrice ? `₹${mPrice}` : 'Free'}</strong></td>
                      <td>
                        {mPrice ? (
                          <div>
                            <span style={{ fontWeight: '600', color: '#0F172A' }}>₹{qPrice.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: '11px', color: '#16A34A', marginLeft: '6px', fontWeight: '700' }}>({qDisc}% off)</span>
                          </div>
                        ) : 'Free'}
                      </td>
                      <td>
                        {mPrice ? (
                          <div>
                            <span style={{ fontWeight: '600', color: '#0F172A' }}>₹{yPrice.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: '11px', color: '#16A34A', marginLeft: '6px', fontWeight: '700' }}>({yDisc}% off)</span>
                          </div>
                        ) : 'Free'}
                      </td>
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-tertiary)' }}>
                    No subjects found matching filters.
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
                      placeholder="e.g. Mathematics (MPBSE Ganit)"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject Code *</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.subjectCode}
                      onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                      placeholder="e.g. MP-MATH-101"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Education Board *</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.board}
                      onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                    >
                      <optgroup label="State Boards (UP, MP, Maharashtra, Bihar, etc.)">
                        {allBoardOptions.filter(b => b.type === 'State Board').map(b => (
                          <option key={b.name} value={b.name}>{b.name} {b.state ? `(${b.state})` : ''}</option>
                        ))}
                      </optgroup>
                      <optgroup label="National & International Boards">
                        {allBoardOptions.filter(b => b.type !== 'State Board').map(b => (
                          <option key={b.name} value={b.name}>{b.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Class / Grade</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    >
                      {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject Price (₹ / Month)</label>
                    <input 
                      type="number"
                      min="0"
                      className={styles.formInput}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 499 (0 for Free)"
                    />
                  </div>

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
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Quarterly Discount (%)</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      className={styles.formInput}
                      value={formData.quarterlyDiscount}
                      onChange={(e) => setFormData({ ...formData, quarterlyDiscount: e.target.value })}
                      placeholder="e.g. 10 (10% off for 3 Months)"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Yearly Discount (%)</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      className={styles.formInput}
                      value={formData.yearlyDiscount}
                      onChange={(e) => setFormData({ ...formData, yearlyDiscount: e.target.value })}
                      placeholder="e.g. 20 (20% off for 1 Year)"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
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
