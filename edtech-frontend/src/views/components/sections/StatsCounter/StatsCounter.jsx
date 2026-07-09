import React, { useRef, useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PLATFORM_STATS } from '../../../../config/constants';
import styles from './StatsCounter.module.css';

gsap.registerPlugin(ScrollTrigger);

const StatItem = ({ stat }) => {
  const valueRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const Icon = Icons[stat.icon] || Icons.Hash;

  useEffect(() => {
    if (!valueRef.current || hasAnimated) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const trigger = ScrollTrigger.create({
      trigger: valueRef.current,
      start: 'top 85%',
      onEnter: () => {
        if (prefersReducedMotion) {
          valueRef.current.textContent = stat.value.toLocaleString();
          return;
        }
        setHasAnimated(true);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.value,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            if (valueRef.current) {
              valueRef.current.textContent = Math.floor(obj.val).toLocaleString();
            }
          },
        });
      },
      once: true,
    });

    return () => trigger.kill();
  }, [stat.value, hasAnimated]);

  return (
    <div className={styles.statCard}>
      <div className={styles.iconWrap}><Icon size={24} /></div>
      <div className={styles.value}>
        <span ref={valueRef}>0</span>
        <span className={styles.suffix}>{stat.suffix}</span>
      </div>
      <span className={styles.label}>{stat.label}</span>
    </div>
  );
};

const StatsCounter = () => {
  return (
    <section className={styles.section} id="stats">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>📊 Our Impact</span>
          <h2 className={styles.title}>Trusted by Students Across India</h2>
          <p className={styles.subtitle}>Join thousands of students already transforming their learning experience.</p>
        </div>
        <div className={styles.grid}>
          {PLATFORM_STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
