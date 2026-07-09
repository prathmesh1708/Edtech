import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, FileCheck, Settings, LogOut, Bell, Menu, X } from 'lucide-react';
import { ROUTES } from '../../../config/routes';
import { useAuth } from '../../../models/context/AuthContext';
import Button from '../common/Button/Button';
import Avatar from '../common/Avatar/Avatar';
import styles from './AdminLayout.module.css';

const ADMIN_MENU_ITEMS = [
  { path: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.ADMIN_STUDENTS, label: 'Students', icon: Users },
  { path: ROUTES.ADMIN_SYLLABUS, label: 'Syllabus Management', icon: BookOpen },
  { path: ROUTES.ADMIN_CONTENT, label: 'Content Approval', icon: FileCheck },
  { path: ROUTES.ADMIN_SETTINGS, label: 'Settings', icon: Settings },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={styles.layout}>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoArea}>
          <Link to="/">
            <img src="/assets/images/logo.png" alt="Study Wisely" />
          </Link>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navSection}>
          {ADMIN_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.footerArea}>
          <Button
            variant="ghost"
            fullWidth
            iconLeft={<LogOut size={18} />}
            onClick={logout}
            style={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start' }}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles.mainContainer}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button className={styles.menuToggle} onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div className={styles.headerTitle}>
              Admin Panel — {ADMIN_MENU_ITEMS.find((item) => item.path === location.pathname)?.label || 'Console'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <Bell size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600' }} className={styles.adminName}>Master Admin</span>
              <Avatar name="Admin User" size="md" />
            </div>
          </div>
        </header>

        <main className={styles.contentBody}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
