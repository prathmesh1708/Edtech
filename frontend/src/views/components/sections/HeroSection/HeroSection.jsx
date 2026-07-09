import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, BotMessageSquare, FileText, Zap, Mic, StickyNote, Target } from 'lucide-react';
import { gsap } from 'gsap';
import { ROUTES } from '../../../../config/routes';
import Button from '../../common/Button/Button';
import styles from './HeroSection.module.css';

const TOOLS = [
  { icon: FileText, name: 'PDF Study', desc: 'Chat with books', color: '#EF4444', bg: '#FEE2E2' },
  { icon: Zap, name: 'Resources', desc: 'Best materials', color: '#4F6EF7', bg: '#EEF2FF' },
  { icon: Mic, name: 'Audio Notes', desc: 'Record & Summarize', color: '#F59E0B', bg: '#FEF3C7' },
  { icon: StickyNote, name: 'Smart Notes', desc: 'Organize thoughts', color: '#22C55E', bg: '#DCFCE7' },
];

const HeroSection = () => {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Content reveal
      gsap.fromTo(
        '.hero-badge',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
      );
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4 }
      );
      gsap.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.6 }
      );
      gsap.fromTo(
        '.hero-actions',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.8 }
      );
      gsap.fromTo(
        '.hero-stats',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 1 }
      );

      // Card reveal
      gsap.fromTo(
        '.hero-card',
        { opacity: 0, x: 60, rotateY: -5 },
        { opacity: 1, x: 0, rotateY: 0, duration: 1, delay: 0.5, ease: 'power3.out' }
      );

      // Floating shapes
      gsap.to('.float-shape', {
        y: -15,
        duration: 3,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.5,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.hero} ref={heroRef}>
      <div className={styles.container}>
        {/* Left Content */}
        <div className={styles.content} ref={contentRef}>
          <div className={`${styles.badge} hero-badge`}>
            <span className={styles.badgeDot} />
            Personalized AI Learning
          </div>

          <h1 className={`${styles.title} hero-title`}>
            Your Ultimate{' '}
            <span className={styles.titleHighlight}>AI Tutor</span>{' '}
            for Top Grades
          </h1>

          <p className={`${styles.subtitle} hero-subtitle`}>
            All-in-One study companion for Class 1 to 12. Get chapter-wise notes,
            AI doubt solving, smart study tools, and personalized learning — all in one platform.
          </p>

          <div className={`${styles.actions} hero-actions`}>
            <Link to={ROUTES.REGISTER}>
              <Button variant="primary" size="lg" iconRight={<ArrowRight size={20} />}>
                Start Learning Free
              </Button>
            </Link>
            <Link to={ROUTES.FEATURES}>
              <Button variant="secondary" size="lg" iconLeft={<Play size={18} />}>
                See How It Works
              </Button>
            </Link>
          </div>

          <div className={`${styles.stats} hero-stats`}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>10,000+</span>
              <span className={styles.statLabel}>Active Students</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>500+</span>
              <span className={styles.statLabel}>Chapters</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>4+</span>
              <span className={styles.statLabel}>Boards</span>
            </div>
          </div>
        </div>

        {/* Right Visual — Interactive Card */}
        <div className={styles.visual}>
          <div className={`${styles.heroCard} hero-card`} ref={cardRef}>
            <div className={styles.heroCardHeader}>
              <div className={styles.greeting}>
                <span className={styles.greetingSmall}>Good Morning 👋</span>
                <span className={styles.greetingLarge}>Ready to top it?</span>
              </div>
            </div>

            {/* AI Doubt Solver Banner */}
            <div className={styles.heroCardBanner}>
              <span className={styles.bannerTag}>AI Doubt Solver</span>
              <h3 className={styles.bannerTitle}>Stuck on a question?</h3>
              <p className={styles.bannerDesc}>Snap, solve, understand it.</p>
            </div>

            {/* Learning Tools Grid */}
            <div className={styles.toolsGrid}>
              {TOOLS.map((tool) => (
                <div key={tool.name} className={styles.toolCard}>
                  <div className={styles.toolIcon} style={{ background: tool.bg, color: tool.color }}>
                    <tool.icon size={18} />
                  </div>
                  <span className={styles.toolName}>{tool.name}</span>
                  <span className={styles.toolDesc}>{tool.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating shapes */}
          <div className={`${styles.floatingShape} ${styles.shape1} float-shape`} />
          <div className={`${styles.floatingShape} ${styles.shape2} float-shape`} />
          <div className={`${styles.floatingShape} ${styles.shape3} float-shape`} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
