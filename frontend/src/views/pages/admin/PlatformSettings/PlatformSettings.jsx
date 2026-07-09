import React, { useState } from 'react';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';

const s = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  }
};

const PlatformSettings = () => {
  const [appName, setAppName] = useState('Study Wisely');
  const [supportEmail, setSupportEmail] = useState('support@studywisely.in');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Global platform settings updated successfully!');
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' }}>
          Platform Settings
        </h3>

        <form onSubmit={handleSave} style={s.form}>
          <Input
            label="Application Name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            required
          />

          <Input
            label="Support Contact Email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            required
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', display: 'block', marginBottom: '2px' }}>
                Maintenance Mode
              </span>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                Restrict client access to study dashboards during updates
              </p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button variant="primary" size="lg" fullWidth loading={saving} type="submit">
              Save Platform Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PlatformSettings;
