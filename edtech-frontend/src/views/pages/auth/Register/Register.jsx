import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import useAuthController from '../../../../controllers/useAuthController';
import styles from './Register.module.css';

const DEFAULT_SCHOOLS = [
  "Delhi Public School (DPS)",
  "Kendriya Vidyalaya (KV)",
  "DAV Public School",
  "St. Xavier's High School",
  "Army Public School",
  "Ryan International School",
  "National Public School (NPS)",
  "Bhavan's Vidya Mandir",
  "Podar International School",
  "Don Bosco School",
  "Apeejay School",
  "Modern School",
  "Amity International School",
  "Holy Cross High School",
  "Sanskriti School"
];

const calculatePasswordStrength = (pass) => {
  if (!pass || pass.length === 0) return { score: 0, label: '', color: 'transparent' };
  if (pass.length < 8) return { score: 1, label: 'Weak', color: '#EF4444' };

  const hasMixed = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
  const hasDigit = /\d/.test(pass);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pass);

  if (pass.length >= 12 && hasMixed && hasDigit && hasSymbol) {
    return { score: 4, label: 'Strong', color: '#22C55E' };
  }
  if (hasMixed || hasDigit || hasSymbol) {
    return { score: 3, label: 'Good', color: '#3B82F6' };
  }
  return { score: 2, label: 'Fair', color: '#F59E0B' };
};

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits;
};

const Register = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const classParam = searchParams.get('class');
  const stepParam = searchParams.get('step');
  const navigate = useNavigate();

  // Guard: if ?class= is missing, redirect to class selection
  useEffect(() => {
    if (!classParam) {
      navigate(`${ROUTES.SELECT_CLASS}?mode=register`, { replace: true });
    }
  }, [classParam, navigate]);

  const currentStep = useMemo(() => {
    return parseInt(stepParam, 10) === 2 ? 2 : 1;
  }, [stepParam]);

  // Unified Form State (preserved across steps and browser navigation)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    schoolName: '',
    city: '',
    board: 'CBSE',
    consent: false,
  });

  const [errors, setErrors] = useState({});
  const [, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Combobox state for schools
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const comboboxRef = useRef(null);

  // Focus management on step change
  const headingRef = useRef(null);
  const [announcement, setAnnouncement] = useState('');

  const { register, loading, error: authError } = useAuthController();

  // Keep search params synced with step
  const setStep = useCallback((newStep) => {
    const params = new URLSearchParams(searchParams);
    params.set('class', classParam || '10');
    params.set('step', String(newStep));
    setSearchParams(params);
    setAnnouncement(`Switched to step ${newStep} of 2`);
    setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
  }, [classParam, searchParams, setSearchParams]);

  // Close combobox when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setIsComboboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rawPhone = useMemo(() => formData.phone.replace(/\D/g, ''), [formData.phone]);
  const isPhoneValid = rawPhone.length === 10 && /^[6-9]/.test(rawPhone);
  const strength = useMemo(() => calculatePasswordStrength(formData.password), [formData.password]);

  // Handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleInputChange('phone', formatted);
  };

  const handleSchoolInputChange = (e) => {
    const val = e.target.value;
    handleInputChange('schoolName', val);
    if (val.trim().length > 0) {
      const filtered = DEFAULT_SCHOOLS.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase())
      );
      setSchoolSuggestions(filtered);
      setIsComboboxOpen(true);
    } else {
      setSchoolSuggestions([]);
      setIsComboboxOpen(false);
    }
  };

  const handleSelectSchool = (school) => {
    handleInputChange('schoolName', school);
    setIsComboboxOpen(false);
  };

  // Validation Logic
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name': {
        const clean = (value || '').trim();
        if (!clean || clean.length < 2 || !/[a-zA-Z]/.test(clean)) {
          return "Enter your full name";
        }
        return '';
      }
      case 'phone': {
        const clean = (value || '').replace(/\D/g, '');
        if (!clean || clean.length !== 10 || !/^[6-9]/.test(clean)) {
          return "Enter a valid 10-digit mobile number";
        }
        return '';
      }
      case 'email': {
        const clean = (value || '').trim();
        if (clean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
          return "Check this email address";
        }
        return '';
      }
      case 'password': {
        if (!value || value.length < 8) {
          return "Use at least 8 characters";
        }
        return '';
      }
      case 'schoolName': {
        if (!value || !value.trim()) {
          return "Enter your school name";
        }
        return '';
      }
      case 'city': {
        const clean = (value || '').trim();
        if (!clean || clean.length < 2) {
          return "Enter your city";
        }
        return '';
      }
      case 'consent': {
        if (!value) {
          return "Please accept the terms and privacy policy to continue";
        }
        return '';
      }
      default:
        return '';
    }
  }, []);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    const nameErr = validateField('name', formData.name);
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validateField('phone', formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const emailErr = validateField('email', formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validateField('password', formData.password);
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const schoolErr = validateField('schoolName', formData.schoolName);
    if (schoolErr) newErrors.schoolName = schoolErr;

    const cityErr = validateField('city', formData.city);
    if (cityErr) newErrors.city = cityErr;

    const consentErr = validateField('consent', formData.consent);
    if (consentErr) newErrors.consent = consentErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email ? formData.email.trim().toLowerCase() : undefined,
      phone: rawPhone,
      password: formData.password,
      role: 'student',
      schoolName: formData.schoolName.trim(),
      city: formData.city.trim(),
      classId: classParam || '10',
      board: formData.board || 'CBSE',
    };

    await register(payload);
  };

  if (!classParam) return null;

  return (
    <div className={styles.page}>
      {/* Screen Reader Step Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      {/* Left Column: 64% on desktop, 100% on mobile */}
      <div className={styles.leftColumn}>
        {/* Sticky Header with 2px Progress Bar */}
        <div className={styles.headerWrapper}>
          <header className={styles.header}>
            <Link to={ROUTES.HOME} className={styles.logoLockup} aria-label="Study Wisely Home">
              <img 
                src="/assets/images/logo.png" 
                alt="Study Wisely" 
                className={styles.logoMark}
              />
              <span className={styles.brandName}>Study Wisely</span>
            </Link>

            <div className={styles.stepIndicator}>
              Step {currentStep} of 2
            </div>
          </header>

          <div 
            className={styles.progressBarTrack} 
            role="progressbar" 
            aria-valuenow={currentStep === 1 ? 50 : 100} 
            aria-valuemin={0} 
            aria-valuemax={100}
            aria-label="Registration progress"
          >
            <div 
              className={styles.progressBarFill} 
              style={{ width: currentStep === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Main Form Center */}
        <main className={styles.formSection}>
          <div className={`${styles.formWrapper} ${styles.animateEntrance}`}>
            {currentStep === 1 ? (
              /* ================= STEP 1 ================= */
              <div 
                key="step-1"
                className={`${styles.stepTransitionContainer} ${styles.stepEnterForward}`}
              >
                <h1 
                  ref={headingRef} 
                  tabIndex={-1} 
                  className={styles.heading}
                  style={{ outline: 'none' }}
                >
                  Create your account
                </h1>
                <p className={styles.subheading}>
                  Takes about 40 seconds. You can add the rest later.
                </p>

                <form className={styles.form} onSubmit={handleStep1Submit} noValidate>
                  {/* Full name */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="reg-name" className={styles.label}>
                      Full name
                    </label>
                    <div 
                      className={`${styles.inputControl} ${errors.name ? styles.inputError : ''}`}
                    >
                      <input
                        id="reg-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Prathmesh Sharma"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className={styles.input}
                      />
                    </div>
                    {errors.name && (
                      <div id="name-error" role="alert" className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Paired Row: Mobile number & Email (optional) */}
                  <div className={styles.fieldGrid}>
                    {/* Mobile number */}
                    <div className={styles.fieldGroup}>
                      <label htmlFor="reg-phone" className={styles.label}>
                        Mobile number
                      </label>
                      <div 
                        className={`${styles.inputControl} ${errors.phone ? styles.inputError : ''}`}
                      >
                        <span className={styles.prefix} aria-hidden="true">+91</span>
                        <input
                          id="reg-phone"
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
                          aria-describedby={errors.phone ? "phone-error" : undefined}
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
                      {errors.phone && (
                        <div id="phone-error" role="alert" className={styles.fieldError}>
                          <AlertCircle size={12} aria-hidden="true" />
                          <span>{errors.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Email address (optional) */}
                    <div className={styles.fieldGroup}>
                      <label htmlFor="reg-email" className={styles.label}>
                        Email <span className={styles.optionalTag}>(optional)</span>
                      </label>
                      <div 
                        className={`${styles.inputControl} ${errors.email ? styles.inputError : ''}`}
                      >
                        <input
                          id="reg-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
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
                  </div>

                  {/* Password with Strength Meter */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="reg-password" className={styles.label}>
                      Password
                    </label>
                    <div 
                      className={`${styles.inputControl} ${errors.password ? styles.inputError : ''}`}
                    >
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : "strength-helper"}
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

                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className={styles.strengthMeter} aria-hidden="true">
                        <div className={styles.strengthSegments}>
                          {[1, 2, 3, 4].map((seg) => (
                            <div 
                              key={seg} 
                              className={styles.segmentBar}
                              style={{
                                backgroundColor: strength.score >= seg ? strength.color : undefined
                              }}
                            />
                          ))}
                        </div>
                        <div className={styles.strengthLabelRow}>
                          <span id="strength-helper">At least 8 characters</span>
                          <span className={styles.strengthText} style={{ color: strength.color }}>
                            {strength.label}
                          </span>
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <div id="password-error" role="alert" className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  {/* Server Error Banner */}
                  {authError && (
                    <div className={styles.errorBanner} role="alert">
                      <AlertCircle size={16} className={styles.errorBannerIcon} aria-hidden="true" />
                      <span>
                        {authError.includes('already registered') ? (
                          <>
                            This number or email is already registered.{' '}
                            <Link to={`${ROUTES.LOGIN}?class=${classParam}`}>Log in instead?</Link>
                          </>
                        ) : (
                          authError
                        )}
                      </span>
                    </div>
                  )}

                  {/* Continue Button */}
                  <div className={styles.buttonRow}>
                    <button type="submit" className={styles.submitBtn}>
                      <span>Continue</span>
                      <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                </form>

                {/* Footer Login Link */}
                <p className={styles.loginFooter}>
                  Already have an account?{' '}
                  <Link to={`${ROUTES.LOGIN}?class=${classParam}`} className={styles.loginLink}>
                    Log in
                  </Link>
                </p>

                {/* Mobile Compact What You Get List (< 1024px) */}
                <div className={styles.mobileFeatureList}>
                  <div className={styles.mobileFeatureItem}>
                    <Check size={14} className={styles.mobileCheck} aria-hidden="true" />
                    <span>Mock tests — Board-pattern papers, auto-graded</span>
                  </div>
                  <div className={styles.mobileFeatureItem}>
                    <Check size={14} className={styles.mobileCheck} aria-hidden="true" />
                    <span>AI tutor — Ask anything, any hour</span>
                  </div>
                  <div className={styles.mobileFeatureItem}>
                    <Check size={14} className={styles.mobileCheck} aria-hidden="true" />
                    <span>Progress tracking — See weak chapters before exams</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= STEP 2 ================= */
              <div 
                key="step-2"
                className={`${styles.stepTransitionContainer} ${styles.stepEnterForward}`}
              >
                <h1 
                  ref={headingRef} 
                  tabIndex={-1} 
                  className={styles.heading}
                  style={{ outline: 'none' }}
                >
                  Where do you study?
                </h1>
                <p className={styles.subheading}>
                  This tailors your syllabus and mock tests.
                </p>

                <form className={styles.form} onSubmit={handleStep2Submit} noValidate>
                  {/* Class Confirmation Card */}
                  <div className={styles.classCard}>
                    <div className={styles.classCardInfo}>
                      <span className={styles.classBadge}>Class {classParam}</span>
                      <span className={styles.classCardTitle}>Standard Curriculum</span>
                    </div>
                    <Link 
                      to={`${ROUTES.SELECT_CLASS}?mode=register`} 
                      className={styles.changeClassLink}
                    >
                      Change
                    </Link>
                  </div>

                  {/* School Name Combobox Autocomplete */}
                  <div className={styles.fieldGroup} ref={comboboxRef}>
                    <label htmlFor="reg-school" className={styles.label}>
                      School name
                    </label>
                    <div className={styles.comboboxWrapper}>
                      <div 
                        className={`${styles.inputControl} ${errors.schoolName ? styles.inputError : ''}`}
                      >
                        <input
                          id="reg-school"
                          name="schoolName"
                          type="text"
                          role="combobox"
                          aria-expanded={isComboboxOpen}
                          aria-autocomplete="list"
                          aria-controls="school-suggestions"
                          aria-activedescendant={
                            activeSuggestionIdx >= 0
                              ? `school-opt-${activeSuggestionIdx}`
                              : undefined
                          }
                          placeholder="e.g. Delhi Public School"
                          value={formData.schoolName}
                          onChange={handleSchoolInputChange}
                          onFocus={() => {
                            if (formData.schoolName.trim()) setIsComboboxOpen(true);
                          }}
                          onBlur={() => handleBlur('schoolName')}
                          onKeyDown={(e) => {
                            if (!isComboboxOpen || schoolSuggestions.length === 0) return;
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setActiveSuggestionIdx((prev) =>
                                prev < schoolSuggestions.length - 1 ? prev + 1 : 0
                              );
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setActiveSuggestionIdx((prev) =>
                                prev > 0 ? prev - 1 : schoolSuggestions.length - 1
                              );
                            } else if (e.key === 'Enter' && activeSuggestionIdx >= 0) {
                              e.preventDefault();
                              handleSelectSchool(schoolSuggestions[activeSuggestionIdx]);
                            } else if (e.key === 'Escape') {
                              setIsComboboxOpen(false);
                            }
                          }}
                          aria-invalid={!!errors.schoolName}
                          aria-describedby={errors.schoolName ? "school-error" : "school-helper"}
                          className={styles.input}
                        />
                      </div>

                      {/* Dropdown Suggestions */}
                      {isComboboxOpen && schoolSuggestions.length > 0 && (
                        <ul 
                          id="school-suggestions" 
                          role="listbox" 
                          className={styles.suggestionsDropdown}
                        >
                          {schoolSuggestions.map((school, idx) => (
                            <li
                              key={school}
                              id={`school-opt-${idx}`}
                              role="option"
                              aria-selected={activeSuggestionIdx === idx}
                              className={`${styles.suggestionItem} ${
                                activeSuggestionIdx === idx ? styles.suggestionItemActive : ''
                              }`}
                              onMouseDown={() => handleSelectSchool(school)}
                            >
                              {school}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <span id="school-helper" className={styles.helperText}>
                      Can't find yours? Type it and we'll add it.
                    </span>

                    {errors.schoolName && (
                      <div id="school-error" role="alert" className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.schoolName}</span>
                      </div>
                    )}
                  </div>

                  {/* Paired Row: City & Board */}
                  <div className={styles.fieldGrid}>
                    {/* City */}
                    <div className={styles.fieldGroup}>
                      <label htmlFor="reg-city" className={styles.label}>
                        City
                      </label>
                      <div 
                        className={`${styles.inputControl} ${errors.city ? styles.inputError : ''}`}
                      >
                        <input
                          id="reg-city"
                          name="city"
                          type="text"
                          autoComplete="address-level2"
                          placeholder="e.g. Raipur / Patna"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          onBlur={() => handleBlur('city')}
                          aria-invalid={!!errors.city}
                          aria-describedby={errors.city ? "city-error" : undefined}
                          className={styles.input}
                        />
                      </div>
                      {errors.city && (
                        <div id="city-error" role="alert" className={styles.fieldError}>
                          <AlertCircle size={12} aria-hidden="true" />
                          <span>{errors.city}</span>
                        </div>
                      )}
                    </div>

                    {/* Board (optional select) */}
                    <div className={styles.fieldGroup}>
                      <label htmlFor="reg-board" className={styles.label}>
                        Board <span className={styles.optionalTag}>(optional)</span>
                      </label>
                      <div className={styles.inputControl}>
                        <select
                          id="reg-board"
                          name="board"
                          value={formData.board}
                          onChange={(e) => handleInputChange('board', e.target.value)}
                          className={styles.select}
                        >
                          <option value="CBSE" className={styles.selectOption}>CBSE</option>
                          <option value="ICSE" className={styles.selectOption}>ICSE</option>
                          <option value="State Board" className={styles.selectOption}>State Board</option>
                          <option value="Other" className={styles.selectOption}>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Parental DPDP Consent Checkbox */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.consentRow} htmlFor="reg-consent">
                      <input
                        id="reg-consent"
                        name="consent"
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => handleInputChange('consent', e.target.checked)}
                        className={styles.checkboxInput}
                        aria-invalid={!!errors.consent}
                        aria-describedby={errors.consent ? "consent-error" : undefined}
                      />
                      <span className={styles.consentLabel}>
                        I agree to the{' '}
                        <a 
                          href="/terms" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.consentLink}
                        >
                          Terms
                        </a>{' '}
                        and{' '}
                        <a 
                          href="/privacy" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.consentLink}
                        >
                          Privacy Policy
                        </a>
                        . If you're under 18, ask a parent to review them with you.
                      </span>
                    </label>

                    {errors.consent && (
                      <div id="consent-error" role="alert" className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.consent}</span>
                      </div>
                    )}
                  </div>

                  {/* Server Error Banner */}
                  {authError && (
                    <div className={styles.errorBanner} role="alert">
                      <AlertCircle size={16} className={styles.errorBannerIcon} aria-hidden="true" />
                      <span>
                        {authError.includes('already registered') ? (
                          <>
                            This number or email is already registered.{' '}
                            <Link to={`${ROUTES.LOGIN}?class=${classParam}`}>Log in instead?</Link>
                          </>
                        ) : (
                          authError
                        )}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons: Back & Create Account */}
                  <div className={styles.buttonRow}>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className={styles.backBtn}
                      disabled={loading}
                    >
                      <ArrowLeft size={15} aria-hidden="true" />
                      <span>Back</span>
                    </button>

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className={styles.submitBtn}
                    >
                      {loading ? (
                        <>
                          <span className={styles.spinner} aria-hidden="true" />
                          <span>Creating account</span>
                        </>
                      ) : (
                        <span>Create account</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer Login Link */}
                <p className={styles.loginFooter}>
                  Already have an account?{' '}
                  <Link to={`${ROUTES.LOGIN}?class=${classParam}`} className={styles.loginLink}>
                    Log in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right Column: Proof Panel (Rendered only on Desktop >= 1024px) */}
      <aside 
        className={styles.proofPanel}
        aria-label="Platform benefits"
      >
        <div className={styles.glowOrb} aria-hidden="true" />

        <div className={styles.proofContent}>
          <h2 className={styles.proofHeading}>What you get</h2>
          <p className={styles.proofSubheading}>
            Free for Class {classParam || '10'}, no card needed
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureCheckIcon} aria-hidden="true" />
              <div className={styles.featureTexts}>
                <span className={styles.featureTitle}>Mock tests</span>
                <span className={styles.featureDesc}>Board-pattern papers, auto-graded.</span>
              </div>
            </div>

            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureCheckIcon} aria-hidden="true" />
              <div className={styles.featureTexts}>
                <span className={styles.featureTitle}>AI tutor</span>
                <span className={styles.featureDesc}>Ask anything, any hour.</span>
              </div>
            </div>

            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureCheckIcon} aria-hidden="true" />
              <div className={styles.featureTexts}>
                <span className={styles.featureTitle}>Progress tracking</span>
                <span className={styles.featureDesc}>See weak chapters before the exam.</span>
              </div>
            </div>
          </div>

          <hr className={styles.proofDivider} aria-hidden="true" />

          <div className={styles.proofFooter}>
            <Users size={14} aria-hidden="true" />
            <span>12,400 students already joined</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Register;
