import React, { useState, useRef, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import Logo from '../../../components/common/Logo/Logo';
import useAuthController from '../../../../controllers/useAuthController';
import authService from '../../../../models/services/authService';
import styles from '../Login/Login.module.css';

const OTP_LENGTH = 4;

const OTPVerification = () => {
  const phone = useLocation().state?.phone;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const [resendMessage, setResendMessage] = useState('');
  const { verifyOTP, loading, error } = useAuthController();
  const inputRefs = useRef([]);
  const formRef = useRef(null);

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(formRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) return;
    await verifyOTP(phone, code);
  };

  const handleResend = async () => {
    setResendMessage('');
    try {
      await authService.sendOTP(phone);
      setTimer(30);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setResendMessage(err.response?.data?.message || 'Could not resend the code. Try again.');
    }
  };

  // Opened directly (refresh or pasted link) — there is no number to verify
  if (!phone) return <Navigate to={ROUTES.LOGIN} replace />;

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.formContainer} ref={formRef}>
          <a href="/" className={styles.logo}>
            <Logo />
          </a>
          <h1 className={styles.title}>Verify OTP 🔐</h1>
          <p className={styles.subtitle}>Enter the {OTP_LENGTH}-digit code sent to your phone</p>

          <form onSubmit={handleVerify}>
            <div className={styles.otpGroup}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={styles.otpInput}
                  style={{
                    borderColor: digit ? 'var(--color-accent)' : 'var(--color-border)',
                    background: digit ? 'rgba(79,110,247,0.04)' : 'var(--color-surface)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)', e.target.style.boxShadow = '0 0 0 3px rgba(79,110,247,0.12)')}
                  onBlur={(e) => (e.target.style.borderColor = digit ? 'var(--color-accent)' : 'var(--color-border)', e.target.style.boxShadow = 'none')}
                />
              ))}
            </div>

            {error && (
              <p role="alert" style={{ color: 'var(--color-error, #ea4335)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-4)' }}>
                {error}
              </p>
            )}
            {import.meta.env.DEV && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-4)' }}>
                Dev mode: the code is 1234.
              </p>
            )}

            <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
              Verify & Continue
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {timer > 0 ? (
              <>Resend code in <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{timer}s</span></>
            ) : (
              <button type="button" onClick={handleResend} style={{ color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit' }}>
                Resend OTP
              </button>
            )}
          </p>
          {resendMessage && (
            <p role="alert" style={{ textAlign: 'center', color: 'var(--color-error, #ea4335)', fontSize: 'var(--text-sm)' }}>{resendMessage}</p>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <h2>Almost There!</h2>
          <p>Just one more step to unlock your personalized learning experience</p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
