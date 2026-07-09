import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../../components/common/Button/Button';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--space-8)', background: 'var(--gradient-surface)' }}>
    <div>
      <div style={{ fontSize: '8rem', fontWeight: '900', fontFamily: 'var(--font-heading)', background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 'var(--space-4)' }}>404</div>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: '700', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-heading)' }}>Page Not Found</h1>
      <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '400px', margin: '0 auto var(--space-8)' }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
        <Link to="/"><Button variant="primary" iconLeft={<Home size={18} />}>Go Home</Button></Link>
        <Button variant="secondary" iconLeft={<ArrowLeft size={18} />} onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>
  </div>
);

export default NotFound;
