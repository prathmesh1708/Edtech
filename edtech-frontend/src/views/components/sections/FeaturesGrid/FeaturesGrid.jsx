import React from 'react';
import * as Icons from 'lucide-react';
import { FEATURES } from '../../../../config/constants';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';
import styles from './FeaturesGrid.module.css';

const FeaturesGrid = () => {
  const headerRef = useScrollAnimation('fadeUp');
  const gridRef = useScrollAnimation('stagger', { stagger: 0.1 });

  return (
    <section className={styles.section} id="features-grid">
      <div className={styles.container}>
        <div className={styles.header} ref={headerRef}>
          <span className={styles.tag}>✨ Learning Tools</span>
          <h2 className={styles.title}>
            Everything You Need to <span className="text-gradient">Excel</span>
          </h2>
          <p className={styles.subtitle}>
            Powerful tools designed to make studying smarter, faster, and more effective for every student.
          </p>
        </div>

        <div className={styles.grid} ref={gridRef}>
          {FEATURES.map((feature, index) => {
            const Icon = Icons[feature.icon] || Icons.Sparkles;
            const isHighlighted = feature.id === 'ai-tutor';

            return (
              <div
                key={feature.id}
                className={`${styles.featureCard} ${isHighlighted ? styles.highlighted : ''}`}
                style={{
                  '--card-color': feature.color,
                }}
              >
                <div
                  className={styles.iconWrapper}
                  style={{
                    background: isHighlighted ? undefined : `${feature.color}14`,
                    color: isHighlighted ? undefined : feature.color,
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
                {!isHighlighted && (
                  <div
                    className={styles.featureCard}
                    style={{ display: 'none' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
