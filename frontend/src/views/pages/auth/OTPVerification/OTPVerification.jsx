import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import styles from '../Login/Login.module.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const formRef = useRef(null);
  const navigate = useNavigate();

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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(ROUTES.STUDENT_DASHBOARD);
    }, 1500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.formContainer} ref={formRef}>
          <a href="/" className={styles.logo}>
            <img src="/assets/images/logo.png" alt="Study Wisely" />
          </a>
          <h1 className={styles.title}>Verify OTP 🔐</h1>
          <p className={styles.subtitle}>Enter the 6-digit code sent to your phone</p>

          <form onSubmit={handleVerify}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', margin: 'var(--space-8) 0' }}>
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
                  style={{
                    width: '52px', height: '56px', textAlign: 'center', fontSize: 'var(--text-2xl)',
                    fontWeight: '700', borderRadius: 'var(--radius-lg)', border: `2px solid ${digit ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    outline: 'none', transition: 'all 0.2s', background: digit ? 'rgba(79,110,247,0.04)' : 'var(--color-surface)',
                    fontFamily: 'var(--font-heading)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)', e.target.style.boxShadow = '0 0 0 3px rgba(79,110,247,0.12)')}
                  onBlur={(e) => (e.target.style.borderColor = digit ? 'var(--color-accent)' : 'var(--color-border)', e.target.style.boxShadow = 'none')}
                />
              ))}
            </div>

            <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
              Verify & Continue
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {timer > 0 ? (
              <>Resend code in <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{timer}s</span></>
            ) : (
              <button onClick={() => setTimer(30)} style={{ color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit' }}>
                Resend OTP
              </button>
            )}
          </p>
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
