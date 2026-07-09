import React, { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { BOARDS, SUBJECTS } from '../../../../config/constants';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

const s = {
  header: {
    marginBottom: 'var(--space-6)',
    width: '100%'
  },
  grid: {
    width: '100%'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)'
  },
  rowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-surface)',
    cursor: 'pointer'
  }
};

const SyllabusManagement = () => {
  const [boards, setBoards] = useState(BOARDS);
  const [subjects, setSubjects] = useState(SUBJECTS);

  const addBoard = () => {
    const name = window.prompt('Enter new Board Name:');
    if (!name) return;
    const newBoard = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      fullName: `${name} Education Board`
    };
    setBoards([...boards, newBoard]);
  };

  const removeBoard = (id) => {
    if (window.confirm('Are you sure you want to remove this board?')) {
      setBoards(boards.filter(b => b.id !== id));
    }
  };

  return (
    <div>
      <div style={s.header} className="responsive-flex-between">
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Syllabus & Boards</h2>
        <Button variant="primary" iconLeft={<Plus size={18} />} onClick={addBoard}>
          Add Board
        </Button>
      </div>

      <div style={s.grid} className="responsive-grid-1-2">
        {/* Boards List */}
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Active Boards</h3>
          <div style={s.list}>
            {boards.map((b) => (
              <div key={b.id} style={s.rowItem} className="subject-card-hover">
                <div>
                  <h4 style={{ fontWeight: '600' }}>{b.name}</h4>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{b.fullName}</span>
                </div>
                <button
                  onClick={() => removeBoard(b.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Subject List */}
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Global Subjects</h3>
          <div className="responsive-grid-2">
            {subjects.map((sub) => (
              <Card key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: `${sub.color}14`, color: sub.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '600' }}>{sub.name}</h4>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>12 classes mapped</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge variant="primary" size="sm">Active</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusManagement;
