import React, { useState } from 'react';
import { useAuth } from '../../../../models/context/AuthContext';
import { BOARDS, CLASSES } from '../../../../config/constants';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Card from '../../../components/common/Card/Card';

const s = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  select: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-border)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    width: '100%',
    background: 'var(--color-surface)'
  }
};

const Settings = () => {
  const { user, updateProfile } = useAuth();
  
  // Set fallback state if user context is empty/null
  const currentUser = user || { name: 'John Doe', email: 'student@example.com', board: 'cbse', classId: '10' };

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [board, setBoard] = useState(currentUser.board);
  const [classId, setClassId] = useState(currentUser.classId);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateProfile({ name, email, board, classId });
      setSaving(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' }}>
          Profile Settings
        </h3>
        
        <form onSubmit={handleSave} style={s.form}>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500', display: 'block', marginBottom: 'var(--space-2)' }}>
              Board Selection
            </label>
            <select
              style={s.select}
              value={board}
              onChange={(e) => setBoard(e.target.value)}
            >
              {BOARDS.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500', display: 'block', marginBottom: 'var(--space-2)' }}>
              Class Selection
            </label>
            <select
              style={s.select}
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              {CLASSES.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button variant="primary" size="lg" fullWidth loading={saving} type="submit">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Settings;
