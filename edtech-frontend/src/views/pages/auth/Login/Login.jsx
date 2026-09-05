import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff, Lock, Users, HelpCircle, AlertCircle } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import useAuthController from '../../../../controllers/useAuthController';
import styles from './Login.module.css';

const TESTIMONIALS = [
  {
    quote: "Study Wisely made Class 12 Physics actually make sense. The mock test cards and chapter notes helped me jump from 68% to 92% in my pre-boards.",
    name: "Ananya R.",
    details: "Class 12, Raipur · CBSE",
    initials: "AR",
  },
  {
    quote: "Being able to study in Hindi and English with instant doubt resolution saved my board prep. Best platform for State board students.",
    name: "Priyanshu K.",
    details: "Class 10, Patna · BSEB",
    initials: "PK",
  },
  {
    quote: "The daily practice questions and concise summaries gave me the confidence I needed for Term exams. Highly recommended!",
    name: "Shreya M.",
    details: "Class 11, Lucknow · UP Board",
    initials: "SM",
  },
];

const mapAuthError = (rawError) => {
  if (!rawError) return null;
  const errStr = String(rawError).toLowerCase();

  if (errStr.includes('network') || errStr.includes('econnrefused') || errStr.includes('failed to fetch')) {
    return "Couldn't reach the server. Check your connection and retry";
  }
  if (errStr.includes('429') || errStr.includes('too many') || errStr.includes('rate limit')) {
    return "Too many attempts. Try again in 5 minutes";
  }
  if (errStr.includes('not found') || errStr.includes('no account') || errStr.includes('user not found')) {
    return "No account with this number. Create one instead?";
  }
  if (errStr.includes('invalid') || errStr.includes('incorrect') || errStr.includes('password') || errStr.includes('401')) {
    return "Incorrect password. Try again or reset it";
  }
  if (errStr.includes('expired')) {
    return "This code expired. Request a new one";
  }
  if (errStr.includes('otp')) {
    return "That code isn't right. Check and re-enter";
  }
  return rawError;
};

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits;
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const classParam = searchParams.get('class');
  const location = useLocation();
  const isAdminFlow = location.pathname === ROUTES.ADMIN_LOGIN;

  // Default mode: Mobile OTP as specified
  const [loginMode, setLoginMode] = useState('otp'); // 'otp' | 'password'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: '', username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [, setTouched] = useState({});

  // Responsive desktop detection for DOM unmounting of Proof Panel (< 1024px)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Testimonials rotation
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const { loginWithEmail, sendOTP, loading, error: authError } = useAuthController();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Rotate testimonials every 8s
  useEffect(() => {
    if (!isDesktop || isHovered || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isDesktop, isHovered, prefersReducedMotion]);

  const rawPhone = useMemo(() => formData.phone.replace(/\D/g, ''), [formData.phone]);
  const isPhoneValid = rawPhone.length === 10;

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = useCallback((field, value) => {
    if (field === 'phone') {
      const clean = (value || '').replace(/\D/g, '');
      if (!clean) {
        return "Enter your 10-digit mobile number";
      }
      if (clean.length !== 10) {
        return "That doesn't look like a valid mobile number";
      }
    }
    if (field === 'username') {
      if (!value || !value.trim()) {
        return "Enter your email address or mobile number";
      }
    }
    if (field === 'password') {
      if (!value) {
        return "Enter your password";
      }
      if (value.length < 6) {
        return "Password must be at least 6 characters";
      }
    }
    return '';
  }, []);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validateAll = () => {
    const newErrors = {};
    if (loginMode === 'otp') {
      const phoneErr = validateField('phone', formData.phone);
      if (phoneErr) newErrors.phone = phoneErr;
    } else {
      const userErr = validateField('username', formData.username);
      if (userErr) newErrors.username = userErr;
      const passErr = validateField('password', formData.password);
      if (passErr) newErrors.password = passErr;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    if (loginMode === 'otp') {
      await sendOTP(rawPhone);
    } else {
      await loginWithEmail(formData.username.trim(), formData.password);
    }
  };

  const activeTestimonial = TESTIMONIALS[testimonialIdx];
  const formErrorMessage = mapAuthError(authError);

  const backLinkTarget = isAdminFlow
    ? ROUTES.HOME
    : (classParam ? ROUTES.SELECT_CLASS : ROUTES.SELECT_CLASS);

  const chipLabel = isAdminFlow
    ? "Back to Home"
    : (classParam ? `Class ${classParam}` : "Class Selection");

  return (
    <div className={styles.page}>
      {/* Left Column: Form (64% desktop, 100% mobile) */}
      <div className={styles.leftColumn}>
        {/* Header (56px, hairline bottom border) */}
        <header className={styles.header}>
          <Link to={ROUTES.HOME} className={styles.logoLockup} aria-label="Study Wisely Home">
            <img 
              src="/assets/images/logo.png" 
              alt="Study Wisely" 
              className={styles.logoMark}
            />
            <span className={styles.brandName}>Study Wisely</span>
          </Link>

          <Link to={backLinkTarget} className={styles.classChip} aria-label={`Navigate back to ${chipLabel}`}>
            <ArrowLeft size={13} aria-hidden="true" />
            <span>{chipLabel}</span>
          </Link>
        </header>

        {/* Main Center Form */}
        <main className={styles.formSection}>
          <div className={`${styles.formWrapper} ${styles.animateEntrance}`}>
            <h1 className={styles.heading}>
              {isAdminFlow ? "Admin portal" : "Welcome back"}
            </h1>
            <p className={styles.subheading}>
              {isAdminFlow
                ? "Sign in with your master credentials to manage the platform."
                : "Log in to pick up where you left off."}
            </p>

            {/* Method Segmented Control */}
            <div 
              className={styles.segmentedControl} 
              role="tablist" 
              aria-label="Login method"
            >
              <div 
                className={styles.segmentPill} 
                style={{
                  transform: loginMode === 'otp' ? 'translateX(0%)' : 'translateX(100%)'
                }}
                aria-hidden="true"
              />
              <button
                type="button"
                role="tab"
                id="tab-otp"
                aria-selected={loginMode === 'otp'}
                aria-controls="panel-otp"
                className={`${styles.segmentBtn} ${loginMode === 'otp' ? styles.segmentBtnActive : ''}`}
                onClick={() => {
                  setLoginMode('otp');
                  setErrors({});
                }}
              >
                Mobile OTP
              </button>
              <button
                type="button"
                role="tab"
                id="tab-password"
                aria-selected={loginMode === 'password'}
                aria-controls="panel-password"
                className={`${styles.segmentBtn} ${loginMode === 'password' ? styles.segmentBtnActive : ''}`}
                onClick={() => {
                  setLoginMode('password');
                  setErrors({});
                }}
              >
                Password
              </button>
            </div>

            {/* Form */}
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {loginMode === 'otp' ? (
                /* Mobile OTP View */
                <div 
                  id="panel-otp" 
                  role="tabpanel" 
                  aria-labelledby="tab-otp"
                  className={styles.fieldGroup}
                >
                  <label htmlFor="mobile-input" className={styles.label}>
                    Mobile number
                  </label>
                  <div 
                    className={`${styles.inputControl} ${errors.phone ? styles.inputError : ''}`}
                  >
                    <span className={styles.prefix} aria-hidden="true">+91</span>
                    <input
                      id="mobile-input"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={11}
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onBlur={() => handleBlur('phone')}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : "phone-helper"}
                      className={styles.input}
                    />
                    <div className={styles.iconRightWrapper}>
                      <Check 
                        size={16} 
                        className={`${styles.checkIcon} ${isPhoneValid ? styles.checkIconVisible : ''}`}
                        aria-hidden="true" 
                      />
                    </div>
                  </div>

                  {errors.phone ? (
                    <div id="phone-error" role="alert" className={styles.fieldError}>
                      <AlertCircle size={12} aria-hidden="true" />
                      <span>{errors.phone}</span>
                    </div>
                  ) : (
                    <span id="phone-helper" className={styles.helperText}>
                      We'll send a 6-digit code. Standard rates apply.
                    </span>
                  )}
                </div>
              ) : (
                /* Password View (Supports Email or Mobile + Password) */
                <div 
                  id="panel-password" 
                  role="tabpanel" 
                  aria-labelledby="tab-password"
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  {/* Email or Mobile Field */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="username-input" className={styles.label}>
                      Email address or mobile
                    </label>
                    <div 
                      className={`${styles.inputControl} ${errors.username ? styles.inputError : ''}`}
                    >
                      <input
                        id="username-input"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="student@email.com or 98765 43210"
                        value={formData.username}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('username')}
                        aria-invalid={!!errors.username}
                        aria-describedby={errors.username ? "username-error" : undefined}
                        className={styles.input}
                      />
                    </div>
                    {errors.username && (
                      <div id="username-error" role="alert" className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.username}</span>
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className={styles.fieldGroup}>
                    <div className={styles.labelRow}>
                      <label htmlFor="password-input" className={styles.label}>
                        Password
                      </label>
                      <Link 
                        to={ROUTES.FORGOT_PASSWORD} 
                        className={styles.forgotLink}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div 
                      className={`${styles.inputControl} ${errors.password ? styles.inputError : ''}`}
                    >
                      <input
                        id="password-input"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('password')}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        className={styles.input}
                      />
                      <div className={styles.iconRightWrapper}>
                        <button
                          type="button"
                          className={styles.togglePassBtn}
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          aria-pressed={showPassword}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    {errors.password && (
                      <div id="password-error" role="alert" className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Level Error Banner */}
              {formErrorMessage && (
                <div className={styles.errorBanner} role="alert">
                  <AlertCircle size={16} className={styles.errorBannerIcon} aria-hidden="true" />
                  <span>{formErrorMessage}</span>
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
                    <span>{loginMode === 'otp' ? 'Sending code' : 'Logging in'}</span>
                  </>
                ) : (
                  <span>{loginMode === 'otp' ? 'Send code' : 'Log in'}</span>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <p className={styles.accountFooter}>
              New here?{' '}
              <Link 
                to={classParam ? `${ROUTES.REGISTER}?class=${classParam}` : `${ROUTES.SELECT_CLASS}?mode=register`}
                className={styles.accountLink}
              >
                Create an account
              </Link>
            </p>

            {/* Hairline Divider & Trust Row */}
            <hr className={styles.hairlineDivider} aria-hidden="true" />

            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <Lock size={12} aria-hidden="true" />
                <span>Encrypted</span>
              </div>
              <div className={styles.trustItem}>
                <Users size={12} aria-hidden="true" />
                <span>12,400+ students</span>
              </div>
              <Link 
                to={ROUTES.SUPPORT} 
                className={styles.trustLink}
                aria-label="Get help or support"
              >
                <HelpCircle size={12} aria-hidden="true" />
                <span>Help</span>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Right Column: Proof Panel (Rendered only on Desktop >= 1024px) */}
      {isDesktop && (
        <aside 
          className={styles.proofPanel}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Student testimonials and platform proof"
        >
          <div className={styles.glowOrb} aria-hidden="true" />

          <div className={styles.proofContent}>
            <div className={styles.testimonialCard} key={testimonialIdx}>
              <blockquote className={styles.testimonialQuote}>
                "{activeTestimonial.quote}"
              </blockquote>

              <div className={styles.studentMeta}>
                <div className={styles.avatarCircle} aria-hidden="true">
                  {activeTestimonial.initials}
                </div>
                <div className={styles.studentDetails}>
                  <span className={styles.studentName}>{activeTestimonial.name}</span>
                  <span className={styles.studentLocation}>{activeTestimonial.details}</span>
                </div>
              </div>
            </div>

            <hr className={styles.proofDivider} aria-hidden="true" />

            <div className={styles.metricsRow}>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>12,400</span>
                <span className={styles.metricLabel}>active students</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>89%</span>
                <span className={styles.metricLabel}>score above target</span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Login;
