import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Database, 
  Cpu as CpuIcon, 
  Server, 
  Activity, 
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import styles from './SystemSettings.module.css';

const SystemSettings = () => {
  // Live metric values
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memory: 42,
    latency: 24
  });

  // Config parameters
  const [config, setConfig] = useState({
    autoBackup: true,
    backupFrequency: 'Daily',
    retentionDays: 30,
    maintenanceMode: false,
    logLevel: 'Info',
    updateTrack: 'Stable',
    compressBackups: true
  });

  const [lastBackup, setLastBackup] = useState('2 hours ago');
  const [isBackingUp, setIsBackingUp] = useState(false);

  const toast = useToast();

  // Simulate dynamically fluctuating server load metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * (25 - 12) + 12),
        memory: Math.floor(Math.random() * (46 - 40) + 40),
        latency: Math.floor(Math.random() * (35 - 18) + 18)
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    toast.success('System configuration parameters updated successfully.', 'Settings Saved');
  };

  const handleManualBackup = () => {
    setIsBackingUp(true);
    toast.info('Initiating raw database snapshot backup...', 'Backup Started');
    
    setTimeout(() => {
      setIsBackingUp(false);
      setLastBackup('Just now');
      toast.success('Database backup created and transferred to S3 storage bucket.', 'Backup Complete');
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>System Settings</h1>
          <p className={styles.subtitle}>Monitor server health, configure automated database backups, and manage systems parameters.</p>
        </div>
      </header>

      {/* Health Metrics Dashboard */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <CpuIcon size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>CPU Core Load</span>
            <span className={styles.metricValue}>{metrics.cpu}%</span>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${metrics.cpu}%` }}></div>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Server size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Memory Utilization</span>
            <span className={styles.metricValue}>{metrics.memory}%</span>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${metrics.memory}%`, backgroundColor: '#34A853' }}></div>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Activity size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>API Endpoint Latency</span>
            <span className={styles.metricValue}>{metrics.latency} ms</span>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${(metrics.latency / 100) * 100}%`, backgroundColor: '#FBBC05' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left Side: Backup Config */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Backup & Maintenance</h2>
          
          <div className={styles.switchGroup}>
            <div className={styles.switchText}>
              <span className={styles.switchLabel}>Automated Backup Logs</span>
              <span className={styles.switchDesc}>Enable daily snapshots of system records.</span>
            </div>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                name="autoBackup"
                checked={config.autoBackup}
                onChange={handleInputChange}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.switchGroup}>
            <div className={styles.switchText}>
              <span className={styles.switchLabel}>Maintenance Offline Mode</span>
              <span className={styles.switchDesc}>Render offline screen for students during updates.</span>
            </div>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                name="maintenanceMode"
                checked={config.maintenanceMode}
                onChange={handleInputChange}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Backup Interval Frequency</label>
            <select 
              name="backupFrequency"
              className={styles.formSelect}
              disabled={!config.autoBackup}
              value={config.backupFrequency}
              onChange={handleInputChange}
            >
              <option value="Hourly">Hourly</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Retention Threshold (Days)</label>
            <input 
              type="number" 
              name="retentionDays"
              min="7"
              max="365"
              className={styles.formInput}
              disabled={!config.autoBackup}
              value={config.retentionDays}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.switchGroup} style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <div className={styles.switchText}>
              <span className={styles.switchLabel}>Compress Archival Backups</span>
              <span className={styles.switchDesc}>Package back-ups inside GZIP formats.</span>
            </div>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                name="compressBackups"
                checked={config.compressBackups}
                onChange={handleInputChange}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-medium)' }}>
              Database backup status: <strong style={{ color: 'var(--color-primary)' }}>{lastBackup}</strong>
            </span>
            <button 
              type="button" 
              className={styles.secondaryButton}
              onClick={handleManualBackup}
              disabled={isBackingUp}
            >
              {isBackingUp ? <RotateCw className="spinIcon" size={16} /> : <Database size={16} />}
              <span>{isBackingUp ? 'Backing Up...' : 'Create Database Backup Now'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Server Configuration */}
        <form onSubmit={handleSaveConfig} className={styles.card}>
          <h2 className={styles.cardTitle}>Global Server Configuration</h2>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>System Logger Level</label>
            <select 
              name="logLevel"
              className={styles.formSelect}
              value={config.logLevel}
              onChange={handleInputChange}
            >
              <option value="Debug">Debug (Verbose Diagnostics)</option>
              <option value="Info">Info (Standard Logging)</option>
              <option value="Warning">Warning (Recoverable Faults)</option>
              <option value="Error">Error (Fatal Errors Only)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Update Distribution Track</label>
            <select 
              name="updateTrack"
              className={styles.formSelect}
              value={config.updateTrack}
              onChange={handleInputChange}
            >
              <option value="Stable">Stable release track (Recommended)</option>
              <option value="Beta">Beta preview builds (Early Access)</option>
              <option value="Developer">Developer nightly builds (Unstable)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(251, 188, 5, 0.08)', border: '1px solid rgba(251, 188, 5, 0.2)' }}>
            <AlertTriangle style={{ color: '#FBBC05', flexShrink: 0 }} size={20} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>Warning Notice</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                Modifying distribution tracks or switching logging levels in production should only be performed during scheduled site maintenance windows.
              </span>
            </div>
          </div>

          <button type="submit" className={styles.primaryButton}>
            <Save size={16} />
            <span>Save System Configuration</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;
