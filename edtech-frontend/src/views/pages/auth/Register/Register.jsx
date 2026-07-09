import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, User, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { gsap } from 'gsap';
import { ROUTES } from '../../../../config/routes';
import { BOARDS, CLASSES } from '../../../../config/constants';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Logo from '../../../components/common/Logo/Logo';
import styles from '../Login/Login.module.css';

const Register = () => {
  const [step, setStep] = useState(1); // 1: details, 2: board/class, 3: OTP
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', board: '', classId: '' });
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(formRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
  }, [step]);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigate(ROUTES.OTP_VERIFICATION);
      }, 1500);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.formContainer} ref={formRef}>
          <Link to="/" className={styles.logo}>
            <Logo />
          </Link>
          <h1 className={styles.title}>Create Account ✨</h1>
          <p className={styles.subtitle}>Step {step} of 3 — {step === 1 ? 'Your Details' : step === 2 ? 'Select Board & Class' : 'Verify Phone'}</p>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-6)' }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'var(--color-accent)' : 'var(--color-border)', transition: 'background 0.3s' }} />
            ))}
          </div>

          <form className={styles.form} onSubmit={handleNext}>
            {step === 1 && (
              <>
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" iconLeft={<User size={18} />} required />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" iconLeft={<Mail size={18} />} required />
                <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" iconLeft={<Phone size={18} />} required />
                <Input label="Password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Create a password" iconLeft={<Lock size={18} />} iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', pointerEvents: 'all' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                } required />
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500', display: 'block', marginBottom: 'var(--space-2)' }}>Select Board <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <div className="responsive-grid-2" style={{ gap: 'var(--space-3)' }}>
                    {BOARDS.map((b) => (
                      <button key={b.id} type="button" onClick={() => setFormData((p) => ({ ...p, board: b.id }))} style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${formData.board === b.id ? 'var(--color-accent)' : 'var(--color-border)'}`, background: formData.board === b.id ? 'rgba(79,110,247,0.04)' : 'var(--color-surface)', cursor: 'pointer', fontWeight: '600', fontSize: 'var(--text-sm)', transition: 'all 0.2s', color: formData.board === b.id ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500', display: 'block', marginBottom: 'var(--space-2)' }}>Select Class <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <div className="responsive-grid-4" style={{ gap: 'var(--space-2)' }}>
                    {CLASSES.map((c) => (
                      <button key={c.id} type="button" onClick={() => setFormData((p) => ({ ...p, classId: String(c.id) }))} style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: `1.5px solid ${formData.classId === String(c.id) ? 'var(--color-accent)' : 'var(--color-border)'}`, background: formData.classId === String(c.id) ? 'rgba(79,110,247,0.04)' : 'var(--color-surface)', cursor: 'pointer', fontWeight: '600', fontSize: 'var(--text-sm)', transition: 'all 0.2s', color: formData.classId === String(c.id) ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', background: 'rgba(79,110,247,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', color: 'var(--color-accent)' }}>
                  <Phone size={28} />
                </div>
                <h3 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Verify Your Phone</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                  We'll send a 6-digit OTP to {formData.phone || '+91 XXXXX XXXXX'}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {step > 1 && (
                <Button variant="secondary" size="lg" type="button" onClick={() => setStep(step - 1)} iconLeft={<ArrowLeft size={18} />}>
                  Back
                </Button>
              )}
              <Button variant="primary" size="lg" fullWidth loading={loading} type="submit" iconRight={<ArrowRight size={18} />}>
                {step === 3 ? 'Send OTP' : 'Continue'}
              </Button>
            </div>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link to={ROUTES.LOGIN}>Sign In</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <h2>Join Study Wisely</h2>
          <p>Start your journey towards academic excellence today!</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
