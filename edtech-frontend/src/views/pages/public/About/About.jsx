import React from 'react';
import { Heart, Target, BookOpen, Users, Shield, Lightbulb } from 'lucide-react';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';
import CTABanner from '../../../components/sections/CTABanner/CTABanner';
import styles from './About.module.css';

const VALUES = [
  { icon: Heart, title: 'Student First', desc: 'Every feature we build starts with student needs in mind.', color: '#EF4444', bg: '#FEE2E2' },
  { icon: Target, title: 'Quality Education', desc: 'Accurate, board-aligned content curated by education experts.', color: '#4F6EF7', bg: '#EEF2FF' },
  { icon: Shield, title: 'Safe Learning', desc: 'Secure, distraction-free environment for focused study.', color: '#22C55E', bg: '#DCFCE7' },
  { icon: Lightbulb, title: 'AI Innovation', desc: 'Leveraging cutting-edge AI to personalize every learning journey.', color: '#F59E0B', bg: '#FEF3C7' },
  { icon: BookOpen, title: 'Accessibility', desc: 'Multi-language support making education accessible to all.', color: '#7C5CFC', bg: '#F3E8FF' },
  { icon: Users, title: 'Community', desc: 'Building a community of learners and educators across India.', color: '#14B8A6', bg: '#CCFBF1' },
];

const TEAM = [
  { name: 'Priya M.', role: 'Founder & CEO', initials: 'PM' },
  { name: 'Arjun S.', role: 'CTO', initials: 'AS' },
  { name: 'Neha R.', role: 'Head of Content', initials: 'NR' },
  { name: 'Vikram K.', role: 'Lead Developer', initials: 'VK' },
];

const About = () => {
  const heroRef = useScrollAnimation('fadeUp');
  const missionRef = useScrollAnimation('slideLeft');
  const valuesRef = useScrollAnimation('stagger', { stagger: 0.1 });

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContainer} ref={heroRef}>
          <span className={styles.tag}>🎓 About Us</span>
          <h1 className={styles.title}>Making Quality Education <span className="text-gradient">Accessible to All</span></h1>
          <p className={styles.subtitle}>
            Study Wisely is building India's most comprehensive AI-powered learning platform for Class 1 to 12 students across all major education boards.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className={styles.mission}>
        <div className={styles.missionContainer}>
          <div className={styles.missionContent} ref={missionRef}>
            <span className={styles.tag}>🎯 Our Mission</span>
            <h2 className={styles.missionTitle}>Empowering Every Student to Reach Their Full Potential</h2>
            <p className={styles.missionText}>
              We believe every student deserves access to personalized, high-quality education regardless of their location or background. Our AI-powered platform combines expert-curated content with intelligent learning tools to create a study companion that adapts to each student's unique needs.
            </p>
            <p className={styles.missionText}>
              From chapter-wise notes to AI doubt solving, from smart study tools to exam preparation support — Study Wisely provides everything a student needs to excel in their academics.
            </p>
          </div>
          <div className={styles.missionVisual}>
            <h2>Study Wisely</h2>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.values}>
        <div className={styles.valuesContainer}>
          <div className={styles.valuesHeader}>
            <span className={styles.tag}>💡 Our Values</span>
            <h2 className={styles.sectionTitle || styles.missionTitle}>What Drives Us</h2>
          </div>
          <div className={styles.valuesGrid} ref={valuesRef}>
            {VALUES.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon} style={{ background: v.bg, color: v.color }}>
                  <v.icon size={28} />
                </div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={styles.team}>
        <div className={styles.teamContainer}>
          <div className={styles.teamHeader}>
            <span className={styles.tag}>👥 Our Team</span>
            <h2 className={styles.missionTitle}>Meet the People Behind Study Wisely</h2>
          </div>
          <div className={styles.teamGrid}>
            {TEAM.map((member) => (
              <div key={member.name} className={styles.teamCard}>
                <div className={styles.teamAvatar}>{member.initials}</div>
                <h4 className={styles.teamName}>{member.name}</h4>
                <span className={styles.teamRole}>{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
};

export default About;
