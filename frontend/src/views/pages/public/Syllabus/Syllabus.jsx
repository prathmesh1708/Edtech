import React from 'react';
import BoardSelector from '../../../components/sections/BoardSelector/BoardSelector';
import CTABanner from '../../../components/sections/CTABanner/CTABanner';

const Syllabus = () => (
  <div style={{ paddingTop: 'var(--space-12)' }}>
    <BoardSelector />
    <CTABanner />
  </div>
);

export default Syllabus;
