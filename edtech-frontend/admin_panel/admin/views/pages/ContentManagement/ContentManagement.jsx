import React, { useState } from 'react';
import { Search, Plus, Book, FileText, Video, MoreVertical } from 'lucide-react';
import styles from './ContentManagement.module.css';

const mockContent = [
  { id: 'CRS001', title: 'Mathematics - Class 10', type: 'Course', modules: 12, students: 450, status: 'Published' },
  { id: 'CRS002', title: 'Physics Fundamentals', type: 'Course', modules: 8, students: 320, status: 'Published' },
  { id: 'DOC001', title: 'Biology Chapter 4 Notes', type: 'Document', modules: '-', students: '-', status: 'Draft' },
  { id: 'VID001', title: 'Chemical Reactions Intro', type: 'Video', modules: '-', students: '-', status: 'Published' },
  { id: 'CRS003', title: 'English Grammar Basics', type: 'Course', modules: 15, students: 890, status: 'Published' },
];

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Syllabus & Content</h1>
          <p className={styles.subtitle}>Manage courses, upload materials, and organize syllabus.</p>
        </div>
        <button className={styles.primaryButton}>
          <Plus size={16} />
          <span>Add Content</span>
        </button>
      </header>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <Book className={styles.statIcon} size={24} color="#1A73E8" />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Courses</span>
            <span className={styles.statValue}>45</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <FileText className={styles.statIcon} size={24} color="#22C55E" />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Study Materials</span>
            <span className={styles.statValue}>324</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Video className={styles.statIcon} size={24} color="#F59E0B" />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Video Lessons</span>
            <span className={styles.statValue}>128</span>
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
              placeholder="Search content..." 
              className={styles.searchInput}
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mockContent.map((content) => (
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
                    <button className={styles.iconButton}><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
