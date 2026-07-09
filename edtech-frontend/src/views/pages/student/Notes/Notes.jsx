import React, { useState } from 'react';
import { Plus, Trash2, Calendar, FileText } from 'lucide-react';
import useContentController from '../../../../controllers/useContentController';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Card from '../../../components/common/Card/Card';

const s = {
  container: {
    width: '100%'
  },
  noteCard: {
    padding: 'var(--space-5)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)'
  },
  noteList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  }
};

const Notes = () => {
  const { notes, addNote, deleteNote } = useContentController();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addNote(title, content);
    setTitle('');
    setContent('');
  };

  return (
    <div style={s.container} className="responsive-grid-1-2">
      {/* Create Note Side */}
      <div>
        <Card>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)' }}>
            Create Study Note
          </h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science formula"
              required
            />
            <Input
              label="Note Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write summaries or equations..."
              textarea
              required
            />
            <Button variant="primary" size="lg" fullWidth iconLeft={<Plus size={18} />} type="submit">
              Save Note
            </Button>
          </form>
        </Card>
      </div>

      {/* View Notes Side */}
      <div>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)' }}>
          Saved Study Notes
        </h3>
        
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
            <FileText size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.5 }} />
            <p>No notes saved yet. Create one to get started!</p>
          </div>
        ) : (
          <div style={s.noteList}>
            {notes.map((note) => (
              <div key={note.id} style={s.noteCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{note.title}</h4>
                  <button
                    onClick={() => deleteNote(note.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'var(--space-2)', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                  <Calendar size={12} />
                  <span>Saved on: {note.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
