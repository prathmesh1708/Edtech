import React, { useState } from 'react';
import { 
  Save, 
  Globe, 
  Shield, 
  CreditCard
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import styles from './PlatformManagement.module.css';

const PlatformManagement = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'Study Wisely Platform',
    supportEmail: 'support@studywisely.in',
    currency: 'INR (₹)',
    maintenanceMode: false,
    
    // Security & Roles
    twoFactorAuth: true,
    passwordExpiry: '90 days',
    sessionTimeout: '30 mins',
    permStudents: true,
    permContent: true,
    permSettings: false,
    permBilling: false,

    // Notifications
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyDigest: true,

    // Billing
    invoiceEmail: 'finance@studywisely.in'
  });

  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCustomChange = (name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    
    // Basic validations
    if (!settings.platformName) {
      toast.error('Platform Name is a required field.', 'Validation Error');
      return;
    }
    if (!settings.supportEmail || !settings.supportEmail.includes('@')) {
      toast.error('Please enter a valid support email address.', 'Validation Error');
      return;
    }
    if (activeTab === 'billing' && (!settings.invoiceEmail || !settings.invoiceEmail.includes('@'))) {
      toast.error('Please enter a valid invoice recipient email address.', 'Validation Error');
      return;
    }

    toast.success('All settings and configuration values have been saved successfully.', 'Configurations Saved');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Platform Settings</h1>
          <p className={styles.subtitle}>Configure global settings, security, and preferences.</p>
        </div>
        <button className={styles.primaryButton} onClick={handleSaveChanges}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </header>

      <div className={styles.layout}>
        {/* Left Side Navigation Menu */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <button 
              className={`${styles.navItem} ${activeTab === 'general' ? styles.active : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Globe size={18} />
              <span>General Settings</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={18} />
              <span>Security & Roles</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'billing' ? styles.active : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              <CreditCard size={18} />
              <span>Billing & Plans</span>
            </button>
          </nav>
        </aside>

        {/* Right Side Settings Panel */}
        <main className={styles.content}>
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className={styles.card}>
              <div>
                <h2 className={styles.cardTitle}>General Platform Info</h2>
                <p className={styles.cardSubtitle}>Update your main platform details and public branding.</p>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Platform Name</label>
                <input 
                  type="text" 
                  name="platformName"
                  className={styles.input} 
                  value={settings.platformName} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Support Email</label>
                <input 
                  type="email" 
                  name="supportEmail"
                  className={styles.input} 
                  value={settings.supportEmail} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Default Currency</label>
                <select 
                  name="currency"
                  className={styles.select}
                  value={settings.currency}
                  onChange={handleInputChange}
                >
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>

              {/* Maintenance Toggle */}
              <div className={styles.switchGroup}>
                <div className={styles.switchText}>
                  <span className={styles.switchLabel}>Maintenance Mode</span>
                  <span className={styles.switchDesc}>Temp offline for users. Admins can bypass.</span>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleInputChange}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          )}

          {/* Security & Roles Tab */}
          {activeTab === 'security' && (
            <div className={styles.card}>
              <div>
                <h2 className={styles.cardTitle}>Default Moderator Permissions</h2>
                <p className={styles.cardSubtitle}>Configure role permissions and access levels for platform moderators.</p>
              </div>

              <div className={styles.checkboxList}>
                <label className={styles.checkboxItem}>
                  <input 
                    type="checkbox" 
                    name="permStudents"
                    className={styles.checkbox}
                    checked={settings.permStudents}
                    onChange={handleInputChange}
                  />
                  <div className={styles.checkboxText}>
                    <span className={styles.checkboxLabel}>Manage Students</span>
                    <span className={styles.checkboxDesc}>Allow creating, editing, and deleting student records.</span>
                  </div>
                </label>

                <label className={styles.checkboxItem}>
                  <input 
                    type="checkbox" 
                    name="permContent"
                    className={styles.checkbox}
                    checked={settings.permContent}
                    onChange={handleInputChange}
                  />
                  <div className={styles.checkboxText}>
                    <span className={styles.checkboxLabel}>Manage Content</span>
                    <span className={styles.checkboxDesc}>Allow modifying course modules, resources, and video lessons.</span>
                  </div>
                </label>

                <label className={styles.checkboxItem}>
                  <input 
                    type="checkbox" 
                    name="permSettings"
                    className={styles.checkbox}
                    checked={settings.permSettings}
                    onChange={handleInputChange}
                  />
                  <div className={styles.checkboxText}>
                    <span className={styles.checkboxLabel}>Manage Settings</span>
                    <span className={styles.checkboxDesc}>Allow altering platform branding and default values.</span>
                  </div>
                </label>

                <label className={styles.checkboxItem}>
                  <input 
                    type="checkbox" 
                    name="permBilling"
                    className={styles.checkbox}
                    checked={settings.permBilling}
                    onChange={handleInputChange}
                  />
                  <div className={styles.checkboxText}>
                    <span className={styles.checkboxLabel}>Manage Billing</span>
                    <span className={styles.checkboxDesc}>Allow checking plan levels and updating card details.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className={styles.card}>
              <div>
                <h2 className={styles.cardTitle}>Billing & Plan Tier</h2>
                <p className={styles.cardSubtitle}>Manage subscription models, check invoice history, and modify invoices.</p>
              </div>

              {/* Billing Info Grid */}
              <div className={styles.billingGrid}>
                <div className={styles.billingItem}>
                  <span className={styles.billingLabel}>Subscription Plan</span>
                  <span className={styles.billingValue}>Enterprise Core</span>
                </div>
                <div className={styles.billingItem}>
                  <span className={styles.billingLabel}>Billing Cycle</span>
                  <span className={styles.billingValue}>Annual Tier</span>
                </div>
                <div className={styles.billingItem}>
                  <span className={styles.billingLabel}>Renewal Date</span>
                  <span className={styles.billingValue}>June 18, 2027</span>
                </div>
                <div className={styles.billingItem}>
                  <span className={styles.billingLabel}>Card Token</span>
                  <span className={styles.billingValue}>Visa ending 4242</span>
                </div>
              </div>

              <div className={styles.formGroup} style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4)' }}>
                <label className={styles.formLabel}>Billing Invoice Recipient Email</label>
                <input 
                  type="email" 
                  name="invoiceEmail"
                  className={styles.input} 
                  value={settings.invoiceEmail} 
                  onChange={handleInputChange} 
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                  All platform transaction PDFs and payment receipts will copy to this address.
                </span>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default PlatformManagement;
