import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { gsap } from 'gsap';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import Logo from '../../../components/common/Logo/Logo';
import styles from './ClassSelection.module.css';

const ClassSelection = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    // Animate the left section elements
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current.querySelector(`.${styles.logo}`), { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      .fromTo(containerRef.current.querySelector(`.${styles.title}`), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
      .fromTo(containerRef.current.querySelector(`.${styles.subtitle}`), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
      .fromTo(containerRef.current.querySelector(`.${styles.grid}`), { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .fromTo(containerRef.current.querySelector(`.${styles.actions}`), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3');
  }, []);

  const classesList = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    label: `Class ${i + 1}`,
    subLabel: i + 1 <= 6 ? 'Primary (Parent Access)' : 'Secondary (Student Access)',
    category: i + 1 <= 6 ? 'primary' : 'secondary'
  }));

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    localStorage.setItem('study_wisely_selected_class', classId);
  };

  const handleContinue = () => {
    if (!selectedClass) return;
    if (mode === 'register') {
      navigate(`${ROUTES.REGISTER}?class=${selectedClass}`);
    } else {
      navigate(`${ROUTES.LOGIN}?class=${selectedClass}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.formContainer} ref={containerRef}>
          <Link to="/" className={styles.logo}>
            <Logo />
          </Link>
          
          <h1 className={styles.title}>Welcome to Study Wisely 🎓</h1>
          <p className={styles.subtitle}>Select your class to begin your customized learning experience.</p>
          
          {/* Class Grid */}
          <div className={styles.grid}>
            {classesList.map((item) => {
              const isSelected = selectedClass === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleClassSelect(item.id)}
                  className={`${styles.classCard} ${isSelected ? styles.active : ''} ${item.category === 'primary' ? styles.primaryGroup : styles.secondaryGroup}`}
                >
                  <div className={styles.iconContainer}>
                    {item.category === 'primary' ? <BookOpen size={18} /> : <GraduationCap size={18} />}
                  </div>
                  <span className={styles.classLabel}>{item.label}</span>
                  <span className={styles.classSubLabel}>{item.category === 'primary' ? 'Parent Managed' : 'Student Managed'}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedClass}
              onClick={handleContinue}
              iconRight={<ArrowRight size={18} />}
            >
              {mode === 'register' ? 'Continue to Sign Up' : 'Continue to Sign In'}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <div className={styles.illustrationWrapper}>
            <svg width="280" height="280" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.floatingSvg}>
              {/* Decorative Background Circles */}
              <circle cx="100" cy="100" r="80" fill="rgba(255, 255, 255, 0.05)" />
              <circle cx="100" cy="100" r="60" fill="rgba(255, 255, 255, 0.08)" />
              
              {/* Portal Base */}
              <rect x="50" y="140" width="100" height="15" rx="7.5" fill="white" opacity="0.3" />
              <rect x="65" y="155" width="70" height="6" rx="3" fill="white" opacity="0.2" />

              {/* Stack of Books */}
              <path d="M60 120 L140 120 L135 135 L55 135 Z" fill="#FBBC05" />
              <path d="M57 125 L138 125" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              
              <path d="M65 100 L135 100 L130 115 L60 115 Z" fill="#34A853" />
              <path d="M62 105 L133 105" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

              {/* Graduation Cap */}
              <path d="M100 50 L140 68 L100 86 L60 68 Z" fill="white" />
              <rect x="88" y="77" width="24" height="18" rx="2" fill="white" opacity="0.9" />
              <path d="M130 68 L130 95 L125 95" stroke="#FBBC05" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="125" cy="95" r="3" fill="#FBBC05" />
              
              {/* Floating Elements */}
              <circle cx="45" cy="60" r="6" fill="#4285F4" opacity="0.8" className={styles.floatElement1} />
              <polygon points="155,75 160,85 150,85" fill="#EA4335" opacity="0.8" className={styles.floatElement2} />
              <rect x="145" y="125" width="10" height="10" rx="2" transform="rotate(45 145 125)" fill="#7C5CFC" opacity="0.8" className={styles.floatElement3} />
            </svg>
          </div>
          <h2>Study Wisely</h2>
          <p>Personalized AI-powered companion assisting students from Class 1 to 12 in achieving top marks.</p>
        </div>
      </div>
    </div>
  );
};

export default ClassSelection;
