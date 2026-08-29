import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Phone, User, Eye, EyeOff, ArrowLeft, School, Shield, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ROUTES } from '../../../../config/routes';
import useAuthController from '../../../../controllers/useAuthController';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Logo from '../../../components/common/Logo/Logo';
import styles from '../Login/Login.module.css';

const Register = () => {
  const [searchParams] = useSearchParams();
  const classParam = searchParams.get('class');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    childName: '',
    schoolName: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  
  const { register, loading, error: authError } = useAuthController();
  
  const formRef = useRef(null);
  const navigate = useNavigate();

  // Redirect to select-class if no class is selected in URL
  useEffect(() => {
    if (!classParam) {
      navigate(`${ROUTES.SELECT_CLASS}?mode=register`, { replace: true });
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
    if (!formData.name) {
      newErrors.name = isParentFlow ? 'Parent name is required' : 'Student name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,12}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (isParentFlow && !formData.childName) {
      newErrors.childName = "Child's name is required";
    }
    if (!formData.schoolName) {
      newErrors.schoolName = 'School name is required';
    }
    if (!formData.address) {
      newErrors.address = 'Residential address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    localStorage.setItem('study_wisely_user_role', isParentFlow ? 'parent' : 'student');
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: isParentFlow ? 'parent' : 'student',
      schoolName: formData.schoolName,
      address: formData.address,
      childName: isParentFlow ? formData.childName : undefined,
      classId: classParam,
      board: 'CBSE'
    };

    await register(payload);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                value={classParam} 
                onChange={(e) => {
                  const newClass = e.target.value;
                  localStorage.setItem('study_wisely_selected_class', newClass);
                  navigate(`${ROUTES.REGISTER}?class=${newClass}`, { replace: true });
                }}
                style={{
                  background: 'var(--color-accent-light, #e0f2fe)',
                  color: 'var(--color-accent-dark, #0284c7)',
                  border: '1px solid var(--color-accent-border, #bae6fd)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  padding: '4px 12px',
                  fontWeight: '600',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((cNum) => (
                  <option key={cNum} value={cNum}>Class {cNum}</option>
                ))}
              </select>
            </div>
          </div>

          <h1 className={styles.title}>{roleLabel} Sign Up ✨</h1>
          <p className={styles.subtitle}>
            {isParentFlow 
              ? "Create parent account to co-manage and review child coursework."
              : "Register your student profile to access interactive learning."}
          </p>

          {authError && (
            <div style={{ color: 'var(--color-error, #ef4444)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textAlign: 'center', fontWeight: '500' }}>
              ⚠️ {authError}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input 
              label={isParentFlow ? "Parent Full Name" : "Student Full Name"} 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder={isParentFlow ? "Parent's name" : "Student's name"} 
              iconLeft={<User size={18} />} 
              error={errors.name}
              required 
            />

            <div className={styles.formGrid}>
              <Input 
                label="Email Address" 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                placeholder="you@email.com" 
                iconLeft={<Mail size={18} />} 
                error={errors.email}
                required 
              />
              <Input 
                label="Phone Number" 
                name="phone" 
                type="tel"
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="Mobile number" 
                iconLeft={<Phone size={18} />} 
                error={errors.phone}
                required 
              />
            </div>

            <div className={styles.formGrid}>
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
              </div>
              
              <div style={{ position: 'relative' }}>
                <Input 
                  label="Confirm Password" 
                  name="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  iconLeft={<Lock size={18} />} 
                  iconRight={
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', pointerEvents: 'all' }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  } 
                  error={errors.confirmPassword}
                  required 
                />
              </div>
            </div>

            {isParentFlow && (
              <Input 
                label="Child Full Name" 
                name="childName" 
                value={formData.childName} 
                onChange={handleChange} 
                placeholder="Child's full name" 
                iconLeft={<User size={18} />} 
                error={errors.childName}
                required 
              />
            )}

            <div className={styles.formGrid}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  {isParentFlow ? "Child Class" : "Selected Class"}
                </label>
                <select 
                  value={classParam}
                  onChange={(e) => {
                    const newClass = e.target.value;
                    localStorage.setItem('study_wisely_selected_class', newClass);
                    navigate(`${ROUTES.REGISTER}?class=${newClass}`, { replace: true });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-light)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer',
                    height: '42px'
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((cNum) => (
                    <option key={cNum} value={cNum}>Class {cNum} ({cNum <= 6 ? 'Parent Managed' : 'Student Managed'})</option>
                  ))}
                </select>
              </div>
              <Input 
                label="School Name" 
                name="schoolName" 
                value={formData.schoolName} 
                onChange={handleChange} 
                placeholder="e.g. KV Public School" 
                iconLeft={<School size={18} />} 
                error={errors.schoolName}
                required 
              />
            </div>

            <Input 
              label="Residential Address" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="e.g. House No., Street Name, City, Pincode" 
              iconLeft={<MapPin size={18} />} 
              error={errors.address}
              required 
            />

            <Button variant="primary" size="lg" fullWidth loading={loading} type="submit" style={{ marginTop: 'var(--space-2)' }}>
              Register & Continue
            </Button>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link to={`${ROUTES.LOGIN}?class=${classParam}`}>Sign In here</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <h2>Join Study Wisely</h2>
          <p>
            {isParentFlow
              ? "Gain transparent tracking access, live parent alerts, and structured course overviews."
              : "Unlock direct mentoring worksheets, mock test portals, and a customizable syllabus dashboard."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
