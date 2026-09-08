import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Award, CheckCircle, Image, Globe } from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import syllabusManagementService from '../../../../../src/models/services/syllabusManagementService';
import styles from './SyllabusContentManagement.module.css';

const BoardSyllabusManagement = () => {
  const toast = useToast();
  const [boards, setBoards] = useState([]);
  const [syllabuses, setSyllabuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [selectedBoardType, setSelectedBoardType] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [formData, setFormData] = useState({
    boardName: '',
    code: '',
    boardType: 'State Board',
    stateName: '',
    stateCode: '',
    description: '',
    logoUrl: '',
    status: 'Active',
    assignedSyllabus: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [boardRes, sylRes] = await Promise.all([
        syllabusManagementService.getBoards(),
        syllabusManagementService.getGlobalSyllabuses()
      ]);
      setBoards(boardRes.data || []);
      setSyllabuses(sylRes.data || []);
    } catch (err) {
      toast.error('Failed to load board configurations.', 'Error');
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
      boardName: '',
      code: '',
      boardType: 'State Board',
      stateName: '',
      stateCode: '',
      description: '',
      logoUrl: '',
      status: 'Active',
      assignedSyllabus: syllabuses[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      boardName: item.boardName,
      code: item.code || '',
      boardType: item.boardType || (item.stateName ? 'State Board' : 'National'),
      stateName: item.stateName || '',
      stateCode: item.stateCode || '',
      description: item.description || '',
      logoUrl: item.logoUrl || '',
      status: item.status || 'Active',
      assignedSyllabus: item.assignedSyllabus?._id || item.assignedSyllabus || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.boardName.trim()) {
      toast.error('Board Name is required.', 'Validation Error');
      return;
    }

    setIsLoading(true);
    try {
      if (currentItem) {
        await syllabusManagementService.updateBoard(currentItem._id, formData);
        toast.success(`Education Board "${formData.boardName}" updated.`, 'Board Updated');
      } else {
        await syllabusManagementService.createBoard(formData);
        toast.success(`Education Board "${formData.boardName}" registered.`, 'Board Registered');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save education board.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    setIsLoading(true);
    try {
      await syllabusManagementService.deleteBoard(currentItem._id);
      toast.success(`Board "${currentItem.boardName}" deleted.`, 'Deleted');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete board.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = boards.filter(b => {
    const matchesSearch = b.boardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (b.stateName && b.stateName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    const bType = b.boardType || (b.stateName ? 'State Board' : 'National');
    const matchesType = selectedBoardType === 'All' || bType === selectedBoardType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Board-wise Syllabus Management</h1>
          <p className={styles.subtitle}>Configure CBSE, ICSE, State Boards (UP, MP, MH, Bihar, etc.), IB, and international syllabus mappings.</p>
        </div>
        <button className={styles.primaryButton} onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Register New Board / State Board</span>
        </button>
      </header>

      {/* Boards Grid View */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(79, 110, 247, 0.1)', color: '#4F6EF7' }}>
            <Award size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{boards.length}</div>
            <div className={styles.kpiLabel}>Total Registered Boards</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <Globe size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{boards.filter(b => (b.boardType === 'State Board' || b.stateName || b.boardName?.toLowerCase().includes('board') && !['CBSE', 'ICSE', 'IB', 'Cambridge'].includes(b.boardName))).length}</div>
            <div className={styles.kpiLabel}>State Boards (UP, MP, MH, etc.)</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{boards.filter(b => b.status === 'Active').length}</div>
            <div className={styles.kpiLabel}>Active Boards</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search by board name, state, or code..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.controlsContainer}>
            <select 
              className={styles.filterSelect}
              value={selectedBoardType}
              onChange={(e) => setSelectedBoardType(e.target.value)}
            >
              <option value="All">All Board Categories</option>
              <option value="State Board">State Boards Only</option>
              <option value="National">National Boards (CBSE/ICSE)</option>
              <option value="International">International Boards (IB/CIE)</option>
            </select>

            <select 
              className={styles.filterSelect}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Board Name</th>
                <th>Category / State</th>
                <th>Board Code</th>
                <th>Description</th>
                <th>Assigned Master Syllabus</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading board records...</td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const isState = item.boardType === 'State Board' || item.stateName;
                  return (
                    <tr key={item._id}>
                      <td className={styles.cellName}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.logoUrl ? (
                            <img src={item.logoUrl} alt={item.boardName} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <Award size={18} color={isState ? "#F59E0B" : "#1A73E8"} />
                          )}
                          <div>
                            <span style={{ fontWeight: '600' }}>{item.boardName}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          background: isState ? 'rgba(245, 158, 11, 0.12)' : 'rgba(79, 110, 247, 0.12)',
                          color: isState ? '#D97706' : '#4F6EF7'
                        }}>
                          {isState ? `🏛️ State: ${item.stateName || 'State Board'}` : `🌐 ${item.boardType || 'National'}`}
                        </span>
                      </td>
                      <td><span className={styles.versionTag}>{item.code || 'N/A'}</span></td>
                      <td>{item.description || (item.stateName ? `${item.stateName} State Curriculum` : 'Standard Board')}</td>
                      <td>{item.assignedSyllabus?.name || 'Master Syllabus Framework'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[(item.status || 'active').toLowerCase()]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                          <button className={styles.iconButton} onClick={() => handleOpenEdit(item)} title="Edit Board">
                            <Edit2 size={14} />
                          </button>
                          <button className={`${styles.iconButton} ${styles.danger}`} onClick={() => { setCurrentItem(item); setIsDeleteModalOpen(true); }} title="Delete Board">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-tertiary)' }}>
                    No boards found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Board Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{currentItem ? 'Edit Education Board' : 'Register New Board'}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Board Category *</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.boardType}
                      onChange={(e) => setFormData({ ...formData, boardType: e.target.value })}
                    >
                      <option value="State Board">State Board (e.g., UP, MP, MH, Bihar)</option>
                      <option value="National">National Board (CBSE, ICSE)</option>
                      <option value="International">International Board (IB, Cambridge)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {formData.boardType === 'State Board' ? 'State / Region *' : 'Region / Country'}
                    </label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.stateName}
                      onChange={(e) => {
                        const sVal = e.target.value;
                        let autoName = formData.boardName;
                        if (formData.boardType === 'State Board' && !currentItem && !formData.boardName) {
                          autoName = sVal ? `${sVal} Board` : '';
                        }
                        setFormData({ ...formData, stateName: sVal, boardName: autoName });
                      }}
                      placeholder="e.g. Madhya Pradesh, Uttar Pradesh, Bihar"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Board Name *</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.boardName}
                      onChange={(e) => setFormData({ ...formData, boardName: e.target.value })}
                      placeholder="e.g. MP Board, UP Board, CBSE, ICSE"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Board Official Code</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. MPBSE, UPMSP, CBSE-IND"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Assign Master Syllabus</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.assignedSyllabus}
                      onChange={(e) => setFormData({ ...formData, assignedSyllabus: e.target.value })}
                    >
                      {syllabuses.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
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
                  <label className={styles.formLabel}>Board Logo Image URL</label>
                  <input 
                    type="text"
                    className={styles.formInput}
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://image-url.jpg"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea 
                    rows={3}
                    className={styles.formTextarea}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Board description and details..."
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{currentItem ? 'Update Board' : 'Save Board'}</button>
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
              <h3 className={styles.modalTitle}>Remove Education Board?</h3>
              <p className={styles.subtitle} style={{ marginTop: '8px' }}>
                Are you sure you want to delete board <strong>{currentItem?.boardName}</strong>?
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

export default BoardSyllabusManagement;
