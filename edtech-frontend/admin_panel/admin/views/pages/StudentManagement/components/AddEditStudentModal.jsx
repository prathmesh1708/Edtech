import React, { useState, useEffect } from 'react';
import { X, Upload, Eye, EyeOff, RefreshCw, User, Mail, Phone, Calendar, MapPin, ShieldCheck, BookOpen, Hash } from 'lucide-react';
import styles from '../StudentManagement.module.css';

const AddEditStudentModal = ({ isOpen, onClose, onSave, student = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    studentId: '',
    dob: '',
    gender: 'Male',
    address: '',
    parentName: '',
    parentPhone: '',
    classId: 'Class 10',
    section: 'A',
    rollNumber: '',
    batch: '2025-2026',
    board: 'CBSE',
    joined: new Date().toISOString().split('T')[0],
    status: 'Active',
    photoUrl: '',
    emailVerified: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        password: '',
        studentId: student.studentId || student.displayId || '',
        dob: student.dob || '2008-05-15',
        gender: student.gender || 'Male',
        address: student.address || '123 Academic Way, Education City',
        parentName: student.parentName || 'Robert Smith',
        parentPhone: student.parentPhone || '+1 (555) 987-6543',
        classId: student.classId || student.grade || 'Class 10',
        section: student.section || 'A',
        rollNumber: student.rollNumber || '104',
        batch: student.batch || '2025-2026',
        board: student.board || 'CBSE',
        joined: student.joined ? student.joined.split('T')[0] : new Date().toISOString().split('T')[0],
        status: student.status || 'Active',
        photoUrl: student.photoUrl || '',
        emailVerified: student.emailVerified !== undefined ? student.emailVerified : true
      });
      setPhotoPreview(student.photoUrl || '');
    } else {
      generateAutoId();
    }
  }, [student, isOpen]);

  const generateAutoId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `STU-2026-${randomNum}`;
    setFormData(prev => ({ ...prev, studentId: newId }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address format';
    }
    if (!student && !formData.password) {
      newErrors.password = 'Password is required for new registration';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Mobile number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.largeModal}`}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{student ? 'Edit Student Profile' : 'Add New Student'}</h2>
            <p className={styles.subtitle}>Enter personal, academic, and parent information</p>
          </div>
          <button className={styles.closeButton} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.modalBody}>
            {/* Photo Upload Section */}
            <div className={styles.photoSection}>
              <div className={styles.photoPreviewWrapper}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className={styles.photoPreviewImg} />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <User size={36} />
                  </div>
                )}
              </div>
              <div className={styles.photoUploadControls}>
                <label className={styles.uploadButton}>
                  <Upload size={16} />
                  <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                </label>
                <span className={styles.uploadHint}>JPG, PNG or WEBP. Max 2MB.</span>
              </div>
            </div>

            <div className={styles.sectionHeader}>
              <User size={16} />
              <span>Personal Information</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Morgan"
                  className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Student ID</label>
                <div className={styles.inputWithAction}>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="e.g. STU-2026-1042"
                    className={styles.formInput}
                  />
                  <button type="button" className={styles.actionBtnIcon} onClick={generateAutoId} title="Auto Generate ID">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="alex@student.edu"
                  className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className={`${styles.formInput} ${errors.phone ? styles.inputError : ''}`}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{student ? 'Password (Leave blank to keep existing)' : 'Account Password *'}</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={student ? '••••••••' : 'Enter password'}
                    className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className={styles.formSelect}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address, City, Zip"
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.sectionHeader}>
              <User size={16} />
              <span>Parent / Guardian Information</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Parent/Guardian Name</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  placeholder="Parent full name"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Parent Contact Number</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 999-8888"
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.sectionHeader}>
              <BookOpen size={16} />
              <span>Academic & Enrollment Details</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Class / Grade</label>
                <select name="classId" value={formData.classId} onChange={handleInputChange} className={styles.formSelect}>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Section</label>
                <select name="section" value={formData.section} onChange={handleInputChange} className={styles.formSelect}>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 104"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Batch / Session</label>
                <select name="batch" value={formData.batch} onChange={handleInputChange} className={styles.formSelect}>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Board</label>
                <select name="board" value={formData.board} onChange={handleInputChange} className={styles.formSelect}>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Admission Date</label>
                <input
                  type="date"
                  name="joined"
                  value={formData.joined}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Account Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className={styles.formSelect}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isLoading}>
              {isLoading ? 'Saving...' : student ? 'Update Student' : 'Save & Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditStudentModal;
