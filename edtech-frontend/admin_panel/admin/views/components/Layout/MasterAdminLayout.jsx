import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import { useAuth } from '../../../../../src/models/context/AuthContext';
import { ROUTES } from '../../../../../src/config/routes';
import styles from './MasterAdminLayout.module.css';

const MasterAdminLayout = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Loading Admin Portal...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Topbar />
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MasterAdminLayout;
