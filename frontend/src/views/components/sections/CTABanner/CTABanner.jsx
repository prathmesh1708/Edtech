import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';
import styles from './CTABanner.module.css';

const CTABanner = () => {
  const ref = useScrollAnimation('scaleIn');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.banner} ref={ref}>
          <div className={styles.content}>
            <span className={styles.tag}><Sparkles size={14} /> AI Essentials</span>
            <h2 className={styles.title}>
              Unlock the Full Potential of Smart AI Tutor
            </h2>
            <p className={styles.subtitle}>
              Join thousands of students scoring top grades with personalized AI-powered study tools.
            </p>
            <div className={styles.actions}>
              <Link to={ROUTES.REGISTER}>
                <button className={styles.primaryBtn}>
                  Get Started Free <ArrowRight size={20} />
                </button>
              </Link>
              <Link to={ROUTES.FEATURES}>
                <button className={styles.secondaryBtn}>
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
