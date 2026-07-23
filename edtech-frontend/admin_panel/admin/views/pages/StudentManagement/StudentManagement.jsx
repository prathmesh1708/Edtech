import React, { useState, useEffect } from 'react';
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
import studentService from '../../../../../src/models/services/studentService';
import styles from './StudentManagement.module.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
    email: '',
    phone: '',
    grade: 'Class 10',
    board: 'CBSE',
    joined: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const toast = useToast();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      grade: 'Class 10',
      board: 'CBSE',
      joined: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await studentService.getStudentsAdmin();
      const mapped = (response.data || []).map(user => ({
        id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        grade: user.classId || 'Class 10',
        board: user.board || 'CBSE',
        joined: user.createdAt ? user.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        status: user.status || 'Active'
      }));
      setStudents(mapped);
    } catch (err) {
      toast.error('Failed to load students from server.', 'Error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const getDisplayId = (student) => {
    if (student.id && student.id.length > 8) {
      return `STU-${student.id.slice(-4).toUpperCase()}`;
    }
    return student.id;
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const displayId = getDisplayId(student);
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGrade = selectedGrade === 'All' || student.grade === selectedGrade;
    const matchesBoard = selectedBoard === 'All' || student.board === selectedBoard;
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesBoard && matchesStatus;
  });

  // Handlers
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Student name is required.', 'Validation Error');
      return;
    }
    if (!formData.email) {
      toast.error('Student email is required.', 'Validation Error');
      return;
    }

    try {
      const studentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        classId: formData.grade,
        board: formData.board,
        status: formData.status
      };
      
      const response = await studentService.createStudentAdmin(studentData);
      const created = response.data;
      
      const mappedNew = {
        id: created._id,
        name: created.name,
        email: created.email || '',
        phone: created.phone || '',
        grade: created.classId || 'Class 10',
        board: created.board || 'CBSE',
        joined: created.createdAt ? created.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        status: created.status || 'Active'
      };

      setStudents(prev => [mappedNew, ...prev]);
      setIsAddModalOpen(false);
      resetForm();
      toast.success(`Student "${mappedNew.name}" enrolled successfully.`, 'Student Added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll student.', 'Error');
      console.error(err);
    }
  };

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      grade: student.grade,
      board: student.board,
      joined: student.joined,
      status: student.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Student name is required.', 'Validation Error');
      return;
    }
    if (!formData.email) {
      toast.error('Student email is required.', 'Validation Error');
      return;
    }

    try {
      const studentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        classId: formData.grade,
        board: formData.board,
        status: formData.status
      };
      
      const response = await studentService.updateStudentAdmin(currentStudent.id, studentData);
      const updated = response.data;
      
      const mappedUpdated = {
        id: updated._id,
        name: updated.name,
        email: updated.email || '',
        phone: updated.phone || '',
        grade: updated.classId || 'Class 10',
        board: updated.board || 'CBSE',
        joined: updated.createdAt ? updated.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        status: updated.status || 'Active'
      };

      setStudents(prev => 
        prev.map(s => s.id === currentStudent.id ? mappedUpdated : s)
      );
      setIsEditModalOpen(false);
      resetForm();
      toast.success(`Student "${formData.name}" profile updated.`, 'Update Successful');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student.', 'Error');
      console.error(err);
    }
  };

  const handleDeleteClick = (student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await studentService.deleteStudentAdmin(currentStudent.id);
      setStudents(prev => prev.filter(s => s.id !== currentStudent.id));
      setIsDeleteModalOpen(false);
      toast.success(`Enrolled student "${currentStudent.name}" has been deleted.`, 'Student Removed');
      setCurrentStudent(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student.', 'Error');
      console.error(err);
    }
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
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className={styles.cellId}>{getDisplayId(student)}</td>
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
                    <label className={styles.formLabel}>Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      placeholder="e.g. sharma@gmail.com"
                      className={styles.formInput}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input 
                      type="text" 
                      name="phone" 
                      placeholder="e.g. 9876543210"
                      className={styles.formInput}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
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
                    <label className={styles.formLabel}>Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      className={styles.formInput}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input 
                      type="text" 
                      name="phone" 
                      className={styles.formInput}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
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
                This action is permanent and will delete the student's registration from the database.
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
