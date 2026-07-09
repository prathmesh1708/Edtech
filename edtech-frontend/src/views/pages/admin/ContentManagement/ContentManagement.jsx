import React, { useState } from 'react';
import { Check, X, FileText, Video, Eye } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';

const s = {
  header: {
    marginBottom: 'var(--space-6)'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-4) var(--space-6)'
  }
};

const ContentManagement = () => {
  const [items, setItems] = useState([
    { id: '1', title: 'Chapter 2 Physics Notes (PDF)', type: 'PDF', class: 'Class 12', uploader: 'Teacher Neha', date: '2026-07-08', status: 'Pending' },
    { id: '2', title: 'Calculus Basics Lesson (Video)', type: 'Video', class: 'Class 12', uploader: 'Teacher Vikram', date: '2026-07-07', status: 'Pending' },
    { id: '3', title: 'Algebra Practice Questions (PDF)', type: 'PDF', class: 'Class 10', uploader: 'Admin System', date: '2026-07-06', status: 'Approved' }
  ]);

  const handleAction = (id, newStatus) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div>
      <div style={s.header}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Content Approvals Workflow</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Review and approve uploaded syllabus materials, notes PDFs, and digital videos.
        </p>
      </div>

      <div style={s.list}>
        {items.map((item) => (
          <Card key={item.id} style={{ padding: 0 }}>
            <div style={s.row}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: item.type === 'PDF' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 110, 247, 0.1)', color: item.type === 'PDF' ? 'var(--color-error)' : 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.type === 'PDF' ? <FileText size={20} /> : <Video size={20} />}
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', fontSize: 'var(--text-base)' }}>{item.title}</h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    Uploaded by {item.uploader} on {item.date} • {item.class}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Badge variant={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'warning'} size="sm">
                  {item.status}
                </Badge>

                {item.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAction(item.id, 'Approved')}
                      style={{ border: 'none', background: 'var(--color-success)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title="Approve Content"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'Rejected')}
                      style={{ border: 'none', background: 'var(--color-error)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title="Reject Content"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;
