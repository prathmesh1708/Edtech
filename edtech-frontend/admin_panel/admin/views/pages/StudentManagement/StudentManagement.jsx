import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Plus, 
  GraduationCap, 
  BookOpen, 
  Layers
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import styles from './StudentManagement.module.css';

const initialStudents = [
  { id: 'STU001', name: 'Rahul Sharma', grade: 'Class 10', board: 'CBSE', joined: '2026-06-10', status: 'Active' },
  { id: 'STU002', name: 'Priya Patel', grade: 'Class 12', board: 'ICSE', joined: '2026-06-12', status: 'Active' },
  { id: 'STU003', name: 'Amit Kumar', grade: 'Class 9', board: 'State Board', joined: '2026-06-15', status: 'Inactive' },
  { id: 'STU004', name: 'Sneha Gupta', grade: 'Class 11', board: 'CBSE', joined: '2026-06-18', status: 'Active' },
  { id: 'STU005', name: 'Rohan Singh', grade: 'Class 10', board: 'ICSE', joined: '2026-06-20', status: 'Active' },
];

const StudentManagement = () => {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedBoard, setSelectedBoard] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: 'Class 10',
    board: 'CBSE',
    joined: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const toast = useToast();

  const resetForm = () => {
    setFormData({
      name: '',
      grade: 'Class 10',
      board: 'CBSE',
      joined: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Date Formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = selectedGrade === 'All' || student.grade === selectedGrade;
    const matchesBoard = selectedBoard === 'All' || student.board === selectedBoard;
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesBoard && matchesStatus;
  });

  // Handlers
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Student name is required.', 'Validation Error');
      return;
    }

    const nextIdNum = Math.max(...students.map(s => parseInt(s.id.replace('STU', '')) || 0), 0) + 1;
    const formattedId = `STU${String(nextIdNum).padStart(3, '0')}`;

    const newStudent = {
      id: formattedId,
      ...formData
    };

    setStudents(prev => [newStudent, ...prev]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success(`Student "${newStudent.name}" enrolled successfully.`, 'Student Added');
  };

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
      board: student.board,
      joined: student.joined,
      status: student.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Student name is required.', 'Validation Error');
      return;
    }

    setStudents(prev => 
      prev.map(s => s.id === currentStudent.id ? { ...s, ...formData } : s)
    );
    setIsEditModalOpen(false);
    resetForm();
    toast.success(`Student "${formData.name}" profiles updated.`, 'Update Successful');
  };

  const handleDeleteClick = (student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setStudents(prev => prev.filter(s => s.id !== currentStudent.id));
    setIsDeleteModalOpen(false);
    toast.success(`Enrolled student "${currentStudent.name}" has been deleted.`, 'Student Removed');
    setCurrentStudent(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Management</h1>
          <p className={styles.subtitle}>Manage student enrollments, profiles, and activities.</p>
        </div>
        <button 
          className={styles.primaryButton}
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
        >
          <Plus size={16} />
          <span>Add Student</span>
        </button>
      </header>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search students by name or ID..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.controlsContainer}>
            <select 
              className={styles.filterSelect}
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
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
                <th>Student ID</th>
                <th>Name</th>
                <th>Grade/Class</th>
                <th>Board</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className={styles.cellId}>{student.id}</td>
                    <td className={styles.cellName}>{student.name}</td>
                    <td>{student.grade}</td>
                    <td>{student.board}</td>
                    <td>{formatDate(student.joined)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[student.status.toLowerCase()]}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.iconButton} 
                          title="Edit Student"
                          onClick={() => handleEditClick(student)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className={`${styles.iconButton} ${styles.danger}`} 
                          title="Delete Student"
                          onClick={() => handleDeleteClick(student)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-tertiary)' }}>
                    No students found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className={styles.cardFooter}>
          <span className={styles.paginationInfo}>
            Showing {filteredStudents.length} of {students.length} students
          </span>
          <div className={styles.paginationControls}>
            <button className={styles.pageButton} disabled>Previous</button>
            <button className={`${styles.pageButton} ${styles.activePage}`}>1</button>
            <button className={styles.pageButton} disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Student</h2>
              <button className={styles.closeButton} onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="e.g. Priyanshu Suryavanshi"
                    className={styles.formInput}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Grade / Class</label>
                    <select 
                      name="grade"
                      className={styles.formSelect}
                      value={formData.grade}
                      onChange={handleInputChange}
                    >
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Education Board</label>
                    <select 
                      name="board"
                      className={styles.formSelect}
                      value={formData.board}
                      onChange={handleInputChange}
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Admission Date *</label>
                    <input 
                      type="date" 
                      name="joined" 
                      required 
                      className={styles.formInput}
                      value={formData.joined}
                      onChange={handleInputChange}
                    />
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
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Modify Student Record</h2>
              <button className={styles.closeButton} onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className={styles.formInput}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Grade / Class</label>
                    <select 
                      name="grade"
                      className={styles.formSelect}
                      value={formData.grade}
                      onChange={handleInputChange}
                    >
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Education Board</label>
                    <select 
                      name="board"
                      className={styles.formSelect}
                      value={formData.board}
                      onChange={handleInputChange}
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Admission Date *</label>
                    <input 
                      type="date" 
                      name="joined" 
                      required 
                      className={styles.formInput}
                      value={formData.joined}
                      onChange={handleInputChange}
                    />
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
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: 'var(--color-error)' }}>Remove Student</h2>
              <button className={styles.closeButton} onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to remove the student enrollment for <strong>{currentStudent?.name}</strong>?</p>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                This is a simulation and will only modify local component state. Refreshing the browser will reload the original records.
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
    </div>
  );
};

export default StudentManagement;
