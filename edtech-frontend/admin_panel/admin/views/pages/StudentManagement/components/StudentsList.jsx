import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Edit2, Trash2, Eye, Key, Activity, 
  Award, Download, FileSpreadsheet, ArrowUpDown, ChevronLeft, ChevronRight, 
  MoreVertical, CheckSquare, ShieldAlert, Lock, UserCheck, RefreshCw, User
} from 'lucide-react';
import styles from '../StudentManagement.module.css';

const StudentsList = ({
  students = [],
  isLoading = false,
  onAddClick,
  onEditClick,
  onViewProfile,
  onViewActivity,
  onViewAcademic,
  onOpenAccessControl,
  onBulkAction,
  onExportCSV,
  onExportPDF
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Sorting state
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Row Action Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDisplayId = (student) => {
    if (student.studentId) return student.studentId;
    if (student.displayId) return student.displayId;
    if (student.id && student.id.length > 8) {
      return `STU-2026-${student.id.slice(-4).toUpperCase()}`;
    }
    return student.id || 'STU-001';
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const displayId = getDisplayId(student);
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.phone && student.phone.includes(searchTerm));

    const matchesClass = selectedClass === 'All' || (student.grade || student.classId) === selectedClass;
    const matchesBatch = selectedBatch === 'All' || (student.batch || '2025-2026') === selectedBatch;
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

    return matchesSearch && matchesClass && matchesBatch && matchesStatus;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (sortField === 'displayId' || sortField === 'studentId') {
      aVal = getDisplayId(a);
      bVal = getDisplayId(b);
    }

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculation
  const totalItems = sortedStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentStudents = sortedStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Management System</h1>
          <p className={styles.subtitle}>Enrolled students directory, activity logs, academic records & access controls.</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} onClick={() => onExportCSV(sortedStudents)}>
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
          <button className={styles.secondaryButton} onClick={() => onExportPDF(sortedStudents)}>
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button className={styles.primaryButton} onClick={onAddClick}>
            <Plus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </header>

      {/* Main Table Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by Name, Email, or Student ID..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className={styles.controlsContainer}>
            <div className={styles.filterGroup}>
              <Filter size={14} className={styles.filterIconLabel} />
              <select 
                className={styles.filterSelect}
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
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

            <select 
              className={styles.filterSelect}
              value={selectedBatch}
              onChange={(e) => { setSelectedBatch(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Batches</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>

            <select 
              className={styles.filterSelect}
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className={styles.bulkToolbar}>
            <span className={styles.bulkCount}>{selectedIds.length} students selected</span>
            <div className={styles.bulkButtons}>
              <button className={styles.bulkBtn} onClick={() => onBulkAction('activate', selectedIds)}>
                <UserCheck size={14} /> Bulk Activate
              </button>
              <button className={styles.bulkBtn} onClick={() => onBulkAction('deactivate', selectedIds)}>
                <ShieldAlert size={14} /> Bulk Deactivate
              </button>
              <button className={styles.bulkBtn} onClick={() => onBulkAction('suspend', selectedIds)}>
                <Lock size={14} /> Bulk Suspend
              </button>
              <button className={`${styles.bulkBtn} ${styles.danger}`} onClick={() => onBulkAction('delete', selectedIds)}>
                <Trash2 size={14} /> Bulk Delete
              </button>
            </div>
          </div>
        )}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={currentStudents.length > 0 && selectedIds.length >= currentStudents.length} 
                  />
                </th>
                <th>Photo</th>
                <th className={styles.sortableTh} onClick={() => handleSort('name')}>
                  Student Name <ArrowUpDown size={12} />
                </th>
                <th className={styles.sortableTh} onClick={() => handleSort('displayId')}>
                  Student ID <ArrowUpDown size={12} />
                </th>
                <th>Class / Batch</th>
                <th>Email / Contact</th>
                <th className={styles.sortableTh} onClick={() => handleSort('joined')}>
                  Enrollment Date <ArrowUpDown size={12} />
                </th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className={styles.skeletonRow}>
                    <td colSpan="9">
                      <div className={styles.skeletonPulse} />
                    </td>
                  </tr>
                ))
              ) : currentStudents.length > 0 ? (
                currentStudents.map((student) => {
                  const displayId = getDisplayId(student);
                  const isSelected = selectedIds.includes(student.id);

                  return (
                    <tr key={student.id} className={isSelected ? styles.selectedRow : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectRow(student.id)}
                        />
                      </td>

                      <td>
                        <div className={styles.avatarMiniWrapper}>
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.name} className={styles.avatarMiniImg} />
                          ) : (
                            <div className={styles.avatarMiniFallback}>
                              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className={styles.cellName}>
                        <span 
                          className={styles.nameLink} 
                          onClick={() => onViewProfile(student)}
                        >
                          {student.name}
                        </span>
                      </td>

                      <td className={styles.cellId}>{displayId}</td>
                      <td>
                        <div>{student.grade || student.classId}</div>
                        <div className={styles.subText}>{student.batch || '2025-2026'}</div>
                      </td>

                      <td>
                        <div>{student.email || 'N/A'}</div>
                        <div className={styles.subText}>{student.phone || 'N/A'}</div>
                      </td>

                      <td>{formatDate(student.joined)}</td>

                      <td>
                        <span className={`${styles.statusBadge} ${styles[(student.status || 'active').toLowerCase()]}`}>
                          {student.status || 'Active'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.iconButton} 
                            title="View Detailed Profile"
                            onClick={() => onViewProfile(student)}
                          >
                            <Eye size={14} />
                          </button>

                          <button 
                            className={styles.iconButton} 
                            title="Edit Student"
                            onClick={() => onEditClick(student)}
                          >
                            <Edit2 size={14} />
                          </button>

                          <div className={styles.dropdownWrap}>
                            <button 
                              className={styles.iconButton}
                              title="More Options"
                              onClick={(e) => toggleDropdown(student.id, e)}
                            >
                              <MoreVertical size={14} />
                            </button>

                            {openDropdownId === student.id && (
                              <div className={styles.actionMenu}>
                                <button onClick={() => { setOpenDropdownId(null); onViewAcademic(student); }}>
                                  <Award size={14} /> Academic Records
                                </button>
                                <button onClick={() => { setOpenDropdownId(null); onViewActivity(student); }}>
                                  <Activity size={14} /> Activity Logs
                                </button>
                                <button onClick={() => { setOpenDropdownId(null); onOpenAccessControl('reset-password', student); }}>
                                  <Key size={14} /> Reset Password
                                </button>
                                <button onClick={() => { setOpenDropdownId(null); onOpenAccessControl('change-class-batch', student); }}>
                                  <ChevronRight size={14} /> Change Class/Batch
                                </button>
                                {student.status === 'Active' ? (
                                  <button onClick={() => { setOpenDropdownId(null); onOpenAccessControl('suspend', student); }}>
                                    <Lock size={14} /> Suspend Student
                                  </button>
                                ) : (
                                  <button onClick={() => { setOpenDropdownId(null); onOpenAccessControl('activate', student); }}>
                                    <UserCheck size={14} /> Activate Account
                                  </button>
                                )}
                                <div className={styles.menuDivider} />
                                <button className={styles.menuDanger} onClick={() => { setOpenDropdownId(null); onOpenAccessControl('delete', student); }}>
                                  <Trash2 size={14} /> Delete Student
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
                    <div className={styles.emptyStateContainer}>
                      <User size={36} className={styles.emptyIcon} />
                      <h3>No Students Found</h3>
                      <p>Try refining your search terms or filter selections.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer Pagination */}
        <div className={styles.cardFooter}>
          <div className={styles.pageSizeSelector}>
            <span>Rows per page:</span>
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className={styles.smallSelect}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <span className={styles.paginationInfo}>
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} students
          </span>

          <div className={styles.paginationControls}>
            <button 
              className={styles.pageButton} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className={styles.pageIndicator}>Page {currentPage} of {totalPages}</span>
            <button 
              className={styles.pageButton} 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsList;
