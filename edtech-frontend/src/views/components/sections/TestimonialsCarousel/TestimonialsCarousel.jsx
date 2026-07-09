import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { TESTIMONIALS } from '../../../../config/constants';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';
import styles from './TestimonialsCarousel.module.css';

const TestimonialsCarousel = () => {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);
  const headerRef = useScrollAnimation('fadeUp');
  const maxIndex = TESTIMONIALS.length - 1;

  const next = () => setCurrent((p) => (p >= maxIndex ? 0 : p + 1));
  const prev = () => setCurrent((p) => (p <= 0 ? maxIndex : p - 1));

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.section} id="testimonials">
      <div className={styles.container}>
        <div className={styles.header} ref={headerRef}>
          <span className={styles.tag}>💬 Student Stories</span>
          <h2 className={styles.title}>What Students Say</h2>
          <p className={styles.subtitle}>
            Hear from students who transformed their learning with Study Wisely.
          </p>
        </div>

        <div className={styles.carousel}>
          <div
            className={styles.track}
            ref={trackRef}
            style={{
              transform: `translateX(calc(-${current} * (340px + var(--space-6))))`,
              justifyContent: 'center',
            }}
          >
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.stars}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" stroke="none" />
                  ))}
                </div>
                <p className={styles.text}>"{t.text}"</p>
                <div className={styles.author}>
                  <div className={styles.authorAvatar}>
                    {t.name.split(' ').map((w) => w[0]).join('')}
                  </div>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{t.name}</span>
                    <span className={styles.authorMeta}>{t.class} • {t.board}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.controls}>
          <button className={styles.controlBtn} onClick={prev} aria-label="Previous testimonial">
            <ChevronLeft size={20} />
          </button>
          <div className={styles.dots}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.active : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button className={styles.controlBtn} onClick={next} aria-label="Next testimonial">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
