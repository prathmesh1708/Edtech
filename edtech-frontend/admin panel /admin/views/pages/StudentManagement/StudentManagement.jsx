import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import styles from './StudentManagement.module.css';

const mockStudents = [
  { id: 'STU001', name: 'Rahul Sharma', grade: 'Class 10', board: 'CBSE', joined: '10 Jun 2026', status: 'Active' },
  { id: 'STU002', name: 'Priya Patel', grade: 'Class 12', board: 'ICSE', joined: '12 Jun 2026', status: 'Active' },
  { id: 'STU003', name: 'Amit Kumar', grade: 'Class 9', board: 'State Board', joined: '15 Jun 2026', status: 'Inactive' },
  { id: 'STU004', name: 'Sneha Gupta', grade: 'Class 11', board: 'CBSE', joined: '18 Jun 2026', status: 'Active' },
  { id: 'STU005', name: 'Rohan Singh', grade: 'Class 10', board: 'ICSE', joined: '20 Jun 2026', status: 'Active' },
];

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Management</h1>
          <p className={styles.subtitle}>Manage student enrollments, profiles, and activities.</p>
        </div>
        <button className={styles.primaryButton}>+ Add Student</button>
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
          <button className={styles.filterButton}>
            <Filter size={18} />
            <span>Filter</span>
          </button>
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
              {mockStudents.map((student) => (
                <tr key={student.id}>
                  <td className={styles.cellId}>{student.id}</td>
                  <td className={styles.cellName}>{student.name}</td>
                  <td>{student.grade}</td>
                  <td>{student.board}</td>
                  <td>{student.joined}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[student.status.toLowerCase()]}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.iconButton}><Edit2 size={16} /></button>
                      <button className={`${styles.iconButton} ${styles.danger}`}><Trash2 size={16} /></button>
                      <button className={styles.iconButton}><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.cardFooter}>
          <span className={styles.paginationInfo}>Showing 1 to 5 of 124 students</span>
          <div className={styles.paginationControls}>
            <button className={styles.pageButton} disabled>Previous</button>
            <button className={`${styles.pageButton} ${styles.activePage}`}>1</button>
            <button className={styles.pageButton}>2</button>
            <button className={styles.pageButton}>3</button>
            <button className={styles.pageButton}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
