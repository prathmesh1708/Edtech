import React, { useState, useEffect } from 'react';
import { 
  Save, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  MapPin, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import { useAuth } from '../../../../../src/models/context/AuthContext';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@studywisely.in',
    phone: user?.phone || '+91 98765 43219',
    role: user?.role || 'Super Admin',
    location: 'Mumbai, India',
    joined: '2026-06-01',
    bio: 'Lead educational administrator overseeing platform content, syllabus definitions, and teacher onboarding schedules.',
    emailAlerts: true
  });

  const toast = useToast();

  // Load from localStorage & setup event listener
  useEffect(() => {
    const saved = localStorage.getItem('admin_profile');
    const defaultData = {
      name: user?.name || 'Admin User',
      email: user?.email || 'admin@studywisely.in',
      phone: user?.phone || '+91 98765 43219',
      role: user?.role || 'Super Admin'
    };
    if (saved) {
      setProfile(prev => ({
        ...prev,
        ...defaultData,
        ...JSON.parse(saved)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        ...defaultData
      }));
    }

    const handleSync = () => {
      const updated = localStorage.getItem('admin_profile');
      if (updated) {
        setProfile(prev => ({
          ...prev,
          ...JSON.parse(updated)
        }));
      }
    };

    window.addEventListener('admin_profile_update', handleSync);
    return () => window.removeEventListener('admin_profile_update', handleSync);
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        role: user.role || prev.role
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profile.name || !profile.email || !profile.phone) {
      toast.error('Full Name, Email, and Phone fields are required.', 'Validation Error');
      return;
    }

    localStorage.setItem('admin_profile', JSON.stringify(profile));
    if (updateProfile) {
      updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      });
    }
    window.dispatchEvent(new Event('admin_profile_update'));
    toast.success('Your admin profile has been successfully saved.', 'Profile Saved');
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Profile</h1>
          <p className={styles.subtitle}>Manage your profile details, contact info, and admin preferences.</p>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Left Side: Summary Card */}
        <div className={styles.card}>
          <div className={styles.profileSummary}>
            <div className={styles.avatar}>
              {getInitials(profile.name)}
            </div>
            <h2 className={styles.summaryName}>{profile.name}</h2>
            <span className={styles.summaryRole}>{profile.role}</span>
          </div>

          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <Mail className={styles.metaIcon} size={16} />
              <span>{profile.email}</span>
            </div>
            <div className={styles.metaItem}>
              <Phone className={styles.metaIcon} size={16} />
              <span>{profile.phone}</span>
            </div>
            <div className={styles.metaItem}>
              <MapPin className={styles.metaIcon} size={16} />
              <span>{profile.location}</span>
            </div>
            <div className={styles.metaItem}>
              <Calendar className={styles.metaIcon} size={16} />
              <span>Joined {formatDate(profile.joined)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form Card */}
        <form onSubmit={handleSaveProfile} className={styles.card}>
          <h2 className={styles.summaryName} style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 'var(--space-3)' }}>
            Profile Details
          </h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                className={styles.formInput}
                value={profile.name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Admin Privilege Role</label>
              <select 
                name="role"
                className={styles.formSelect}
                value={profile.role}
                onChange={handleInputChange}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="Content Creator">Content Creator</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address *</label>
              <input 
                type="email" 
                name="email" 
                required 
                className={styles.formInput}
                value={profile.email}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number *</label>
              <input 
                type="text" 
                name="phone" 
                required 
                className={styles.formInput}
                value={profile.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Location</label>
              <input 
                type="text" 
                name="location" 
                className={styles.formInput}
                value={profile.location}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Joined Date</label>
              <input 
                type="date" 
                name="joined" 
                className={styles.formInput}
                value={profile.joined}
                onChange={handleInputChange}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Administrator Bio / Notes</label>
              <textarea 
                name="bio" 
                className={styles.formTextarea}
                value={profile.bio}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles.switchGroup}>
            <div className={styles.switchText}>
              <span className={styles.switchLabel}>Email Broadcast Updates</span>
              <span className={styles.switchDesc}>Receive confirmation copies whenever announcements go live.</span>
            </div>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                name="emailAlerts"
                checked={profile.emailAlerts}
                onChange={handleInputChange}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <button type="submit" className={styles.primaryButton}>
            <Save size={16} />
            <span>Save Profile Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
