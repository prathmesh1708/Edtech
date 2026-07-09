import React, { useState } from 'react';
import { UserPlus, Search, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

const s = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-6)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 'var(--space-4)',
    textAlign: 'left'
  },
  th: {
    padding: 'var(--space-4)',
    borderBottom: '2px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontWeight: '700',
    fontSize: 'var(--text-sm)'
  },
  td: {
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border-light)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)'
  }
};

const StudentManagement = () => {
  const [students, setStudents] = useState([
    { id: '1', name: 'Aarav Sharma', email: 'aarav@gmail.com', phone: '+91 98765 43210', class: 'Class 10', board: 'CBSE', status: 'Active' },
    { id: '2', name: 'Priya Patel', email: 'priya@yahoo.com', phone: '+91 99887 76655', class: 'Class 12', board: 'ICSE', status: 'Active' },
    { id: '3', name: 'Rahul Kumar', email: 'rahul@outlook.com', phone: '+91 91234 56789', class: 'Class 8', board: 'State Board', status: 'Blocked' },
  ]);

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(st => {
      if (st.id === id) {
        return { ...st, status: st.status === 'Active' ? 'Blocked' : 'Active' };
      }
      return st;
    }));
  };

  const deleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      setStudents(prev => prev.filter(st => st.id !== id));
    }
  };

  return (
    <div>
      <div style={s.header}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Student Accounts</h2>
        <Button variant="primary" iconLeft={<UserPlus size={18} />} onClick={() => alert('Feature to create student accounts coming in Phase 3!')}>
          Add Student
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '16px', marginBottom: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <Input placeholder="Search students by name, email or phone..." iconLeft={<Search size={18} />} />
          </div>
        </div>

        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Phone</th>
              <th style={s.th}>Class / Board</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td style={s.td}><strong>{student.name}</strong></td>
                <td style={s.td}>{student.email}</td>
                <td style={s.td}>{student.phone}</td>
                <td style={s.td}>{student.class} • {student.board}</td>
                <td style={s.td}>
                  <Badge variant={student.status === 'Active' ? 'success' : 'error'} size="sm">
                    {student.status}
                  </Badge>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => toggleStatus(student.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                      title={student.status === 'Active' ? 'Block Account' : 'Activate Account'}
                    >
                      {student.status === 'Active' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                    </button>
                    <button
                      onClick={() => deleteStudent(student.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                      title="Delete Account"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default StudentManagement;
