import React, { useState, useEffect } from 'react';
import { Search, Bell, User, X } from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import { useAuth } from '../../../../../src/models/context/AuthContext';
import styles from './Topbar.module.css';

const Topbar = () => {
  const { user, updateProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('admin_profile');
    const defaultData = {
      name: user?.name || 'Admin User',
      email: user?.email || 'admin@studywisely.in',
      phone: user?.phone || '+91 98765 43219',
      role: user?.role || 'Super Admin'
    };
    return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
  });

  // Form temporary values state
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const toast = useToast();

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('admin_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    };
    window.addEventListener('admin_profile_update', handleSync);
    return () => window.removeEventListener('admin_profile_update', handleSync);
  }, []);

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

  const handleProfileClick = () => {
    setTempProfile({ ...profile });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!tempProfile.name || !tempProfile.email || !tempProfile.phone) {
      toast.error('All fields are required to update your profile.', 'Validation Error');
      return;
    }

    setProfile({ ...tempProfile });
    localStorage.setItem('admin_profile', JSON.stringify(tempProfile));
    if (updateProfile) {
      updateProfile({
        name: tempProfile.name,
        email: tempProfile.email,
        phone: tempProfile.phone
      });
    }
    window.dispatchEvent(new Event('admin_profile_update'));
    setIsModalOpen(false);
    toast.success('Your admin profile details have been saved.', 'Profile Updated');
  };

  // Helper to extract initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input 
          type="text" 
          placeholder="Search students, courses, or settings..." 
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>
        
        <div className={styles.profileMenu} onClick={handleProfileClick} title="View Admin Profile">
          <div className={styles.avatar}>
            {profile.name ? getInitials(profile.name) : <User size={20} />}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.name}>{profile.name}</span>
            <span className={styles.role}>{profile.role}</span>
          </div>
        </div>
      </div>

      {/* Admin Profile Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Admin Profile settings</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className={styles.formInput}
                    value={tempProfile.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    className={styles.formInput}
                    value={tempProfile.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    required 
                    className={styles.formInput}
                    value={tempProfile.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Admin Privilege Role</label>
                  <select 
                    name="role"
                    className={styles.formSelect}
                    value={tempProfile.role}
                    onChange={handleInputChange}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Content Creator">Content Creator</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryModalButton} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryModalButton}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
