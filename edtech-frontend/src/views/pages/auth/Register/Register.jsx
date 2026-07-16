import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Phone, User, Eye, EyeOff, ArrowLeft, School, Shield } from 'lucide-react';
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
    schoolName: ''
  });
  const [errors, setErrors] = useState({});
  
  const { register, loading, error: authError } = useAuthController();
  
  const formRef = useRef(null);
  const navigate = useNavigate();

  // Redirect to select-class if no class is selected
  useEffect(() => {
    if (!classParam) {
      const storedClass = localStorage.getItem('study_wisely_selected_class');
      if (storedClass) {
        navigate(`${ROUTES.REGISTER}?class=${storedClass}`, { replace: true });
      } else {
        navigate(`${ROUTES.SELECT_CLASS}?mode=register`, { replace: true });
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
            <div className={styles.classBadge}>
              Class {classParam}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <Input 
                label={isParentFlow ? "Child Class (Read Only)" : "Selected Class (Read Only)"} 
                name="childClassReadOnly" 
                value={`Class ${classParam}`} 
                disabled 
                placeholder={`Class ${classParam}`} 
                iconLeft={<Shield size={18} />} 
                style={{ opacity: 0.8 }}
              />
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
