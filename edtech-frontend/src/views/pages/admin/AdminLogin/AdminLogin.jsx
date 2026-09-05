import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import { useAuth } from '../../../../models/context/AuthContext';
import authService from '../../../../models/services/authService';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Administrator email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Master password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data } = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, ...user } = data;

      // Verify Administrator privileges
      if (user.role !== 'admin') {
        throw new Error('Access Denied: Administrator privileges required.');
      }

      setAuth(user, token);
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.adminContainer}>
        <div className={styles.adminCard}>
          <div className={styles.cardHeader}>
            <div className={styles.shieldBadge}>
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Master Admin Access</span>
            </div>

            <div className={styles.logoRow}>
              <img 
                src="/assets/images/logo-dark.png" 
                alt="Study Wisely" 
                className={styles.logoMark} 
              />
              <h1 className={styles.cardTitle}>Study Wisely</h1>
            </div>

            <p className={styles.cardSubtitle}>
              Management Console & Content Administration
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Admin Email */}
            <div className={styles.fieldGroup}>
              <label htmlFor="admin-email" className={styles.label}>
                Administrator Email
              </label>
              <div 
                className={`${styles.inputControl} ${errors.email ? styles.inputError : ''}`}
              >
                <div className={styles.inputIcon} aria-hidden="true">
                  <Mail size={16} />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@studywisely.in"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "admin-email-err" : undefined}
                  className={styles.input}
                />
              </div>
              {errors.email && (
                <div id="admin-email-err" role="alert" className={styles.fieldError}>
                  <AlertCircle size={12} aria-hidden="true" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Master Password */}
            <div className={styles.fieldGroup}>
              <label htmlFor="admin-password" className={styles.label}>
                Master Password
              </label>
              <div 
                className={`${styles.inputControl} ${errors.password ? styles.inputError : ''}`}
              >
                <div className={styles.inputIcon} aria-hidden="true">
                  <Lock size={16} />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "admin-pass-err" : undefined}
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.iconRightBtn}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div id="admin-pass-err" role="alert" className={styles.fieldError}>
                  <AlertCircle size={12} aria-hidden="true" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className={styles.errorBanner} role="alert">
                <ShieldAlert size={16} className={styles.errorBannerIcon} aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Console</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice & Return Link */}
        <div className={styles.securityNotice}>
          <span>Restricted Portal · Authorized Personnel Only · 256-Bit SSL</span>
        </div>

        <Link to={ROUTES.LOGIN} className={styles.backHomeLink}>
          <ArrowLeft size={13} aria-hidden="true" />
          <span>Return to Student Sign In</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
