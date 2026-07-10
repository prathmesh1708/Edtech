import React from 'react';
import { Outlet } from 'react-router-dom';

const StudentLayout = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'var(--font-body)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <h1>Student Portal</h1>
        <p>Welcome to your learning dashboard.</p>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
