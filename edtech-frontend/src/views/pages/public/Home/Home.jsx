import React from 'react';
import HeroSection from '../../../components/sections/HeroSection/HeroSection';
import FeaturesGrid from '../../../components/sections/FeaturesGrid/FeaturesGrid';
import BoardSelector from '../../../components/sections/BoardSelector/BoardSelector';
import StatsCounter from '../../../components/sections/StatsCounter/StatsCounter';
import TestimonialsCarousel from '../../../components/sections/TestimonialsCarousel/TestimonialsCarousel';
import CTABanner from '../../../components/sections/CTABanner/CTABanner';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.page}>
      <HeroSection />
      <FeaturesGrid />
      <BoardSelector />
      <StatsCounter />
      <TestimonialsCarousel />
      <CTABanner />
    </div>
  );
};

export default Home;
