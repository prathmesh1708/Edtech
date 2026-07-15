import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff, ArrowLeft, Shield, User } from 'lucide-react';
import { gsap } from 'gsap';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Logo from '../../../components/common/Logo/Logo';
import styles from './Login.module.css';

const Login = () => {
  const [searchParams] = useSearchParams();
  const classParam = searchParams.get('class');
  
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const formRef = useRef(null);
  const navigate = useNavigate();

  // Redirect to select-class if no class is selected
  useEffect(() => {
    if (!classParam) {
      const storedClass = localStorage.getItem('study_wisely_selected_class');
      if (storedClass) {
        navigate(`${ROUTES.LOGIN}?class=${storedClass}`, { replace: true });
      } else {
        navigate(ROUTES.SELECT_CLASS, { replace: true });
      }
    }
  }, [classParam, navigate]);

  // Animate form mount
  useEffect(() => {
    if (!formRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    gsap.fromTo(formRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, [classParam]);

  if (!classParam) return null;

  const selectedClassNum = parseInt(classParam, 10);
  const isParentFlow = selectedClassNum <= 6;
  const roleLabel = isParentFlow ? 'Parent' : 'Student';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (loginMode === 'email') {
      if (!formData.username) {
        newErrors.username = isParentFlow ? 'Mobile or Email is required' : 'Email or Mobile is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = 'Mobile number is required';
      } else if (!/^\+?[0-9]{10,12}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
        newErrors.phone = 'Enter a valid mobile number';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    // Simulate API Login
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('study_wisely_user_role', isParentFlow ? 'parent' : 'student');
      localStorage.setItem('study_wisely_auth_token', 'mock_token_xyz123');
      
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
          <div className={styles.navHeader}>
            <Link to={ROUTES.SELECT_CLASS} className={styles.backLink}>
              <ArrowLeft size={16} />
              <span>Back to Class Selection</span>
            </Link>
          </div>

          <div className={styles.logoRow}>
            <Logo />
            <div className={styles.classBadge}>
              Class {classParam}
            </div>
          </div>

          <h1 className={styles.title}>{roleLabel} Login 🔐</h1>
          <p className={styles.subtitle}>
            {isParentFlow 
              ? "Access parent portal to oversee and manage your child's lessons."
              : "Access your student dashboard and resume learning."}
          </p>

          {isParentFlow && (
            <div className={styles.infoBanner}>
              <Shield size={16} className={styles.bannerIcon} />
              <span>Parents manage child credentials and progress for Class 1 to 6.</span>
            </div>
          )}

          {/* Toggle */}
          <div className={styles.toggleRow}>
            <button 
              className={`${styles.toggleBtn} ${loginMode === 'email' ? styles.active : ''}`} 
              onClick={() => { setLoginMode('email'); setErrors({}); }}
            >
              <Mail size={14} style={{ marginRight: 4, display: 'inline' }} /> Credentials
            </button>
            <button 
              className={`${styles.toggleBtn} ${loginMode === 'otp' ? styles.active : ''}`} 
              onClick={() => { setLoginMode('otp'); setErrors({}); }}
            >
              <Phone size={14} style={{ marginRight: 4, display: 'inline' }} /> Mobile OTP
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {loginMode === 'email' ? (
              <>
                <Input 
                  label={isParentFlow ? "Mobile Number or Email" : "Email Address or Mobile"} 
                  name="username" 
                  type="text" 
                  value={formData.username} 
                  onChange={handleChange} 
                  placeholder={isParentFlow ? "e.g. parent@email.com or 9876543210" : "e.g. student@email.com or 9876543210"} 
                  iconLeft={formData.username.includes('@') ? <Mail size={18} /> : <User size={18} />} 
                  error={errors.username}
                  required 
                />
                
                <div style={{ position: 'relative' }}>
                  <Input 
                    label="Password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    iconLeft={<Lock size={18} />} 
                    iconRight={
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', pointerEvents: 'all' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    } 
                    error={errors.password}
                    required 
                  />
                  <div className={styles.forgot}>
                    <Link to={ROUTES.FORGOT_PASSWORD}>Forgot Password?</Link>
                  </div>
                </div>
              </>
            ) : (
              <Input 
                label="Mobile Number" 
                name="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+91 XXXXX XXXXX" 
                iconLeft={<Phone size={18} />} 
                error={errors.phone}
                required 
              />
            )}

            <Button variant="primary" size="lg" fullWidth loading={loading} type="submit" style={{ marginTop: 'var(--space-2)' }}>
              {loginMode === 'otp' ? 'Send Verification OTP' : 'Secure Sign In'}
            </Button>
          </form>

          <p className={styles.footer}>
            Don't have an account? <Link to={`${ROUTES.REGISTER}?class=${classParam}`}>Create {roleLabel} Account</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <h2>Study Wisely</h2>
          <p>
            {isParentFlow 
              ? "Oversee coursework, tracking sheets, assessment grades, and customized AI recommendations."
              : "Interactive modules, mock test cards, live analytics, and 24/7 AI-Tutor mentorship."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
