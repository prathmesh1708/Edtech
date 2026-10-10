import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Users, HelpCircle, AlertCircle } from 'lucide-react';
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

// Maps a failed sign-in to user-facing copy. The HTTP status decides first, so a missing
// API route (404 "Not Found - /api/...") is never shown as "no account with this number".
const mapAuthError = (rawError, status) => {
  if (!rawError) return null;
  const errStr = String(rawError).toLowerCase();

  if (!status) {
    if (errStr.includes('network') || errStr.includes('econnrefused') || errStr.includes('failed to fetch') || errStr.includes('timeout')) {
      return "Couldn't reach the server. Check your connection and retry";
    }
    return rawError; // client-side errors, e.g. "Access Denied: ..."
  }
  if (status === 429) {
    return "Too many attempts. Try again in 5 minutes";
  }
  if (status === 404 && errStr.startsWith('not found - ')) {
    return "Login is temporarily unavailable. Please try again later";
  }
  if (status >= 500 && status !== 501) { // 501 = feature not available; its message is shown as sent
    return "Something went wrong on our side. Please try again";
  }
  if (status === 401) {
    return "Incorrect email or password. Try again or reset it";
  }
  if (errStr.includes('expired')) {
    return "This code expired. Request a new one";
  }
  if (errStr.includes('no account') || errStr.includes('user not found')) {
    return "No account with this email. Create one instead?";
  }
  return rawError;
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const classParam = searchParams.get('class');
  const location = useLocation();
  const isAdminFlow = location.pathname === ROUTES.ADMIN_LOGIN;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
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

  const { loginWithEmail, loading, error: authError, errorStatus: authErrorStatus } = useAuthController();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = useCallback((field, value) => {
    if (field === 'email') {
      if (!value || !value.trim()) {
        return "Enter your email address";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return "Enter a valid email address";
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
    const emailErr = validateField('email', formData.email);
    if (emailErr) newErrors.email = emailErr;
    const passErr = validateField('password', formData.password);
    if (passErr) newErrors.password = passErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    await loginWithEmail(formData.email.trim(), formData.password);
  };

  const activeTestimonial = TESTIMONIALS[testimonialIdx];
  const formErrorMessage = mapAuthError(authError, authErrorStatus);

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

            {/* Form */}
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email Field */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="email-input" className={styles.label}>
                    Email address
                  </label>
                  <div 
                    className={`${styles.inputControl} ${errors.email ? styles.inputError : ''}`}
                  >
                    <input
                      id="email-input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="student@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('email')}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={styles.input}
                    />
                  </div>
                  {errors.email && (
                    <div id="email-error" role="alert" className={styles.fieldError}>
                      <AlertCircle size={12} aria-hidden="true" />
                      <span>{errors.email}</span>
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
                    <span>Logging in</span>
                  </>
                ) : (
                  <span>Log in</span>
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
