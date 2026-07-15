import React, { useState } from 'react';
import { 
  Search, 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail,
  Calendar
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import styles from './TeacherManagement.module.css';

const initialTeachers = [
  { id: 'TCH001', name: 'Dr. Ananya Sen', email: 'ananya.sen@studywisely.com', phone: '+91 98765 43210', subject: 'Mathematics', classes: 'Class 10, Class 12', joined: '2025-01-15', status: 'Active' },
  { id: 'TCH002', name: 'Prof. Vikram Malhotra', email: 'v.malhotra@studywisely.com', phone: '+91 98765 43211', subject: 'Physics', classes: 'Class 11, Class 12', joined: '2025-03-12', status: 'Active' },
  { id: 'TCH003', name: 'Sanya Mirza', email: 'sanya.mirza@studywisely.com', phone: '+91 98765 43212', subject: 'Chemistry', classes: 'Class 9, Class 10', joined: '2025-05-05', status: 'Active' },
  { id: 'TCH004', name: 'Rajesh Khanna', email: 'rajesh.khanna@studywisely.com', phone: '+91 98765 43213', subject: 'English', classes: 'Class 8, Class 9, Class 10', joined: '2025-07-19', status: 'Inactive' },
  { id: 'TCH005', name: 'Pooja Hegde', email: 'pooja.hegde@studywisely.com', phone: '+91 98765 43214', subject: 'Biology', classes: 'Class 11, Class 12', joined: '2025-09-22', status: 'Active' },
];

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Mathematics',
    classes: '',
    joined: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const toast = useToast();

  // Reset form helper
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Mathematics',
      classes: '',
      joined: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
  };

  // Get Initials for Avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Format Date for Display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filtering Logic
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'All' || teacher.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'All' || teacher.status === selectedStatus;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Calculate statistics
  const totalCount = teachers.length;
  const activeCount = teachers.filter(t => t.status === 'Active').length;
  const inactiveCount = totalCount - activeCount;
  const uniqueSubjects = [...new Set(teachers.map(t => t.subject))].length;

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.classes) {
      toast.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    const nextIdNum = Math.max(...teachers.map(t => parseInt(t.id.replace('TCH', '')))) + 1;
    const formattedId = `TCH${String(nextIdNum).padStart(3, '0')}`;

    const newTeacher = {
      id: formattedId,
      ...formData
    };

    setTeachers(prev => [newTeacher, ...prev]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success(`${newTeacher.name} has been added successfully.`, 'Teacher Added');
  };

  const handleEditClick = (teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      classes: teacher.classes,
      joined: teacher.joined,
      status: teacher.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.classes) {
      toast.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    setTeachers(prev => 
      prev.map(t => t.id === currentTeacher.id ? { ...t, ...formData } : t)
    );
    setIsEditModalOpen(false);
    resetForm();
    toast.success(`${formData.name}'s details updated successfully.`, 'Teacher Updated');
  };

  const handleDeleteClick = (teacher) => {
    setCurrentTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setTeachers(prev => prev.filter(t => t.id !== currentTeacher.id));
    setIsDeleteModalOpen(false);
    toast.success(`${currentTeacher.name} has been removed.`, 'Teacher Removed');
    setCurrentTeacher(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Teacher Management</h1>
          <p className={styles.subtitle}>Onboard, assign courses, and manage teacher profiles.</p>
        </div>
        <button 
          className={styles.primaryButton}
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
        >
          <Plus size={18} />
          <span>Add Teacher</span>
        </button>
      </header>

      {/* Stats Cards */}
      <section className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#1B3A8C', backgroundColor: 'rgba(27, 58, 140, 0.08)' }}>
            <GraduationCap size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Faculty</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#22C55E', backgroundColor: 'rgba(34, 197, 150, 0.08)' }}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active</span>
            <span className={styles.statValue}>{activeCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Inactive</span>
            <span className={styles.statValue}>{inactiveCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#7C5CFC', backgroundColor: 'rgba(124, 92, 252, 0.08)' }}>
            <BookOpen size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Core Subjects</span>
            <span className={styles.statValue}>{uniqueSubjects}</span>
          </div>
        </div>
      </section>

      {/* Main card list */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by name, ID or subject..." 
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
              <option value="English">English</option>
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
                <th>Teacher ID</th>
                <th>Name / Profile</th>
                <th>Subject Specialty</th>
                <th>Classes Assigned</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className={styles.cellId}>{teacher.id}</td>
                    <td>
                      <div className={styles.profileCell}>
                        <div className={styles.avatar}>
                          {getInitials(teacher.name)}
                        </div>
                        <div className={styles.profileDetails}>
                          <span className={styles.profileName}>{teacher.name}</span>
                          <span className={styles.profileEmail}>{teacher.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{teacher.subject}</td>
                    <td>{teacher.classes}</td>
                    <td>{formatDate(teacher.joined)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${teacher.status === 'Active' ? styles.active : styles.inactive}`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.iconButton} 
                          onClick={() => handleEditClick(teacher)}
                          title="Edit Teacher"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={`${styles.iconButton} ${styles.danger}`} 
                          onClick={() => handleDeleteClick(teacher)}
                          title="Delete Teacher"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
                    No teachers found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.paginationInfo}>
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </span>
          <div className={styles.paginationControls}>
            <button className={styles.pageButton} disabled>Previous</button>
            <button className={`${styles.pageButton} ${styles.activePage}`}>1</button>
            <button className={styles.pageButton} disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Teacher</h2>
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
                    placeholder="e.g. Dr. Ramesh Kumar"
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
                      placeholder="e.g. ramesh@studywisely.com"
                      className={styles.formInput}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number *</label>
                    <input 
                      type="text" 
                      name="phone" 
                      required 
                      placeholder="e.g. +91 98765 43210"
                      className={styles.formInput}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject Specialty *</label>
                    <select 
                      name="subject"
                      className={styles.formSelect}
                      value={formData.subject}
                      onChange={handleInputChange}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Joined Date *</label>
                    <input 
                      type="date" 
                      name="joined" 
                      required 
                      className={styles.formInput}
                      value={formData.joined}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Classes Taught * (comma separated)</label>
                  <input 
                    type="text" 
                    name="classes" 
                    required 
                    placeholder="e.g. Class 10, Class 11, Class 12"
                    className={styles.formInput}
                    value={formData.classes}
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

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Onboard Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Teacher Details</h2>
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
                    <label className={styles.formLabel}>Phone Number *</label>
                    <input 
                      type="text" 
                      name="phone" 
                      required 
                      className={styles.formInput}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject Specialty *</label>
                    <select 
                      name="subject"
                      className={styles.formSelect}
                      value={formData.subject}
                      onChange={handleInputChange}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Joined Date *</label>
                    <input 
                      type="date" 
                      name="joined" 
                      required 
                      className={styles.formInput}
                      value={formData.joined}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Classes Taught * (comma separated)</label>
                  <input 
                    type="text" 
                    name="classes" 
                    required 
                    className={styles.formInput}
                    value={formData.classes}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: 'var(--color-error)' }}>Remove Teacher</h2>
              <button className={styles.closeButton} onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to remove <strong>{currentTeacher?.name}</strong> from the faculty list?</p>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                This action is simulated and will only affect local state. The changes will reset when you refresh the page.
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

export default TeacherManagement;
