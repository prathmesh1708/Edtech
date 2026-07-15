import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Book, 
  FileText, 
  Video, 
  X, 
  Edit2, 
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import styles from './ContentManagement.module.css';

const initialContent = [
  { id: 'CRS001', title: 'Mathematics - Class 10', type: 'Course', modules: '12', students: '450', status: 'Published' },
  { id: 'CRS002', title: 'Physics Fundamentals', type: 'Course', modules: '8', students: '320', status: 'Published' },
  { id: 'CRS003', title: 'English Grammar Basics', type: 'Course', modules: '15', students: '890', status: 'Published' },
  { id: 'CRS004', title: 'Chemistry Introduction', type: 'Course', modules: '10', students: '210', status: 'Published' },
  { id: 'CRS005', title: 'History of Ancient India', type: 'Course', modules: '6', students: '180', status: 'Published' },
  
  { id: 'DOC001', title: 'Biology Chapter 4 Notes', type: 'Document', modules: '-', students: '-', status: 'Draft' },
  { id: 'DOC002', title: 'Trigonometry Formula Sheet', type: 'Document', modules: '-', students: '-', status: 'Published' },
  { id: 'DOC003', title: 'English Literature Study Guide', type: 'Document', modules: '-', students: '-', status: 'Published' },
  { id: 'DOC004', title: 'Calculus Advanced Lecture Notes', type: 'Document', modules: '-', students: '-', status: 'Draft' },
  
  { id: 'VID001', title: 'Chemical Reactions Video Intro', type: 'Video', modules: '-', students: '-', status: 'Published' },
  { id: 'VID002', title: 'Electrostatics Lecture 1 Video', type: 'Video', modules: '-', students: '-', status: 'Published' },
  { id: 'VID003', title: 'Periodic Table Video Overview', type: 'Video', modules: '-', students: '-', status: 'Draft' },
];

const ContentManagement = () => {
  const [contentList, setContentList] = useState(initialContent);
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    type: 'Course',
    modules: '',
    students: '',
    status: 'Published'
  });

  const toast = useToast();

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'Course',
      modules: '',
      students: '',
      status: 'Published'
    });
  };

  // Statistics
  const coursesCount = contentList.filter(c => c.type === 'Course' && c.status !== 'Draft').length;
  const materialsCount = contentList.filter(c => (c.type === 'Document' || c.type === 'Video') && c.status !== 'Draft').length;
  const draftsCount = contentList.filter(c => c.status === 'Draft').length;

  // Filter content
  const filteredContent = contentList.filter(item => {
    // 1. Tab Filter
    let matchesTab = false;
    if (activeTab === 'courses') {
      matchesTab = item.type === 'Course' && item.status !== 'Draft';
    } else if (activeTab === 'materials') {
      matchesTab = (item.type === 'Document' || item.type === 'Video') && item.status !== 'Draft';
    } else if (activeTab === 'drafts') {
      matchesTab = item.status === 'Draft';
    }

    // 2. Search Filter
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

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
    if (!formData.title) {
      toast.error('Title is required.', 'Validation Error');
      return;
    }

    let prefix = 'CRS';
    if (formData.type === 'Document') prefix = 'DOC';
    if (formData.type === 'Video') prefix = 'VID';

    const nextIdNum = Math.max(...contentList
      .filter(c => c.id.startsWith(prefix))
      .map(c => parseInt(c.id.replace(prefix, '')) || 0)
    , 0) + 1;

    const formattedId = `${prefix}${String(nextIdNum).padStart(3, '0')}`;

    const newContent = {
      id: formattedId,
      title: formData.title,
      type: formData.type,
      modules: formData.type === 'Course' ? (formData.modules || '0') : '-',
      students: formData.type === 'Course' ? (formData.students || '0') : '-',
      status: formData.status
    };

    setContentList(prev => [newContent, ...prev]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success(`"${newContent.title}" has been successfully added.`, 'Content Published');
  };

  const handleEditClick = (content) => {
    setCurrentContent(content);
    setFormData({
      title: content.title,
      type: content.type,
      modules: content.modules === '-' ? '' : content.modules,
      students: content.students === '-' ? '' : content.students,
      status: content.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Title is required.', 'Validation Error');
      return;
    }

    setContentList(prev => 
      prev.map(c => c.id === currentContent.id ? { 
        ...c, 
        title: formData.title,
        type: formData.type,
        modules: formData.type === 'Course' ? (formData.modules || '0') : '-',
        students: formData.type === 'Course' ? (formData.students || '0') : '-',
        status: formData.status
      } : c)
    );
    setIsEditModalOpen(false);
    resetForm();
    toast.success(`"${formData.title}" details updated.`, 'Content Updated');
  };

  const handleDeleteClick = (content) => {
    setCurrentContent(content);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setContentList(prev => prev.filter(c => c.id !== currentContent.id));
    setIsDeleteModalOpen(false);
    toast.success(`"${currentContent.title}" has been deleted.`, 'Content Removed');
    setCurrentContent(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Syllabus & Content</h1>
          <p className={styles.subtitle}>Manage courses, upload materials, and organize syllabus.</p>
        </div>
        <button 
          className={styles.primaryButton}
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
        >
          <Plus size={16} />
          <span>Add Content</span>
        </button>
      </header>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <Book className={styles.statIcon} size={24} color="#1A73E8" />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Courses</span>
            <span className={styles.statValue}>{coursesCount}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <FileText className={styles.statIcon} size={24} color="#22C55E" />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Study Materials</span>
            <span className={styles.statValue}>{materialsCount}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Clock className={styles.statIcon} size={24} color="#F59E0B" />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Drafts Count</span>
            <span className={styles.statValue}>{draftsCount}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'courses' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'materials' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            Study Materials
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'drafts' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('drafts')}
          >
            Drafts
          </button>
        </div>

        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search content by title or ID..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Content ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Modules</th>
                <th>Enrolled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.length > 0 ? (
                filteredContent.map((content) => (
                  <tr key={content.id}>
                    <td className={styles.cellId}>{content.id}</td>
                    <td className={styles.cellTitle}>
                      <div className={styles.titleWrapper}>
                        {content.type === 'Course' && <Book size={16} className={styles.typeIconCourse} />}
                        {content.type === 'Document' && <FileText size={16} className={styles.typeIconDoc} />}
                        {content.type === 'Video' && <Video size={16} className={styles.typeIconVideo} />}
                        <span>{content.title}</span>
                      </div>
                    </td>
                    <td>{content.type}</td>
                    <td>{content.modules}</td>
                    <td>{content.students}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[content.status.toLowerCase()]}`}>
                        {content.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.iconButton} 
                          title="Edit Details"
                          onClick={() => handleEditClick(content)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className={`${styles.iconButton} ${styles.danger}`} 
                          title="Delete Content"
                          onClick={() => handleDeleteClick(content)}
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
                    No content found matching this tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Content Modal */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Syllabus Content</h2>
              <button className={styles.closeButton} onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    placeholder="e.g. Algebra Formulas & Exercises"
                    className={styles.formInput}
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Content Type</label>
                    <select 
                      name="type"
                      className={styles.formSelect}
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="Course">Course</option>
                      <option value="Document">Study Material (Document)</option>
                      <option value="Video">Video Lesson</option>
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
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {formData.type === 'Course' && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Modules Count</label>
                      <input 
                        type="number" 
                        name="modules" 
                        placeholder="e.g. 12"
                        className={styles.formInput}
                        value={formData.modules}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Students Enrolled</label>
                      <input 
                        type="number" 
                        name="students" 
                        placeholder="e.g. 450"
                        className={styles.formInput}
                        value={formData.students}
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
                  Publish Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Content Details</h2>
              <button className={styles.closeButton} onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    className={styles.formInput}
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Content Type</label>
                    <select 
                      name="type"
                      className={styles.formSelect}
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="Course">Course</option>
                      <option value="Document">Study Material (Document)</option>
                      <option value="Video">Video Lesson</option>
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
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {formData.type === 'Course' && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Modules Count</label>
                      <input 
                        type="number" 
                        name="modules" 
                        className={styles.formInput}
                        value={formData.modules}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Students Enrolled</label>
                      <input 
                        type="number" 
                        name="students" 
                        className={styles.formInput}
                        value={formData.students}
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
              <h2 className={styles.modalTitle} style={{ color: 'var(--color-error)' }}>Remove Content</h2>
              <button className={styles.closeButton} onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to remove the content item <strong>{currentContent?.title}</strong>?</p>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                This is a local simulation. The deleted content will reappear if you refresh the browser page.
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

export default ContentManagement;
