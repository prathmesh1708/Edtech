import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { gsap } from 'gsap';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import styles from './Login.module.css';

const Login = () => {
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!formRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    gsap.fromTo(formRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }, []);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: API call
    setTimeout(() => {
      setLoading(false);
      if (loginMode === 'otp') {
        navigate(ROUTES.OTP_VERIFICATION);
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD);
      }
    }, 1500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.formContainer} ref={formRef}>
          <Link to="/" className={styles.logo}>
            <img src="/assets/images/logo.png" alt="Study Wisely" />
          </Link>
          <h1 className={styles.title}>Welcome Back 👋</h1>
          <p className={styles.subtitle}>Sign in to continue your learning journey</p>

          {/* Toggle */}
          <div className={styles.toggleRow}>
            <button className={`${styles.toggleBtn} ${loginMode === 'email' ? styles.active : ''}`} onClick={() => setLoginMode('email')}>
              <Mail size={14} style={{ marginRight: 4, display: 'inline' }} /> Email Login
            </button>
            <button className={`${styles.toggleBtn} ${loginMode === 'otp' ? styles.active : ''}`} onClick={() => setLoginMode('otp')}>
              <Phone size={14} style={{ marginRight: 4, display: 'inline' }} /> OTP Login
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {loginMode === 'email' ? (
              <>
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" iconLeft={<Mail size={18} />} required />
                <Input label="Password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Enter your password" iconLeft={<Lock size={18} />} iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', pointerEvents: 'all' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                } required />
                <div className={styles.forgot}>
                  <Link to={ROUTES.FORGOT_PASSWORD}>Forgot Password?</Link>
                </div>
              </>
            ) : (
              <Input label="Mobile Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" iconLeft={<Phone size={18} />} required />
            )}

            <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
              {loginMode === 'otp' ? 'Send OTP' : 'Sign In'}
            </Button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <div className={styles.socialBtns}>
            <button className={styles.socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>

          <p className={styles.footer}>
            Don't have an account? <Link to={ROUTES.REGISTER}>Sign Up</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <h2>Your Ultimate AI Tutor</h2>
          <p>All-in-One Companion for Top Grades — Class 1 to 12</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
