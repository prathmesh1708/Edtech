import React from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, BookOpen, Clock, Settings, User, Bell, Bot, FileText } from 'lucide-react';
import Logo from '../../common/Logo/Logo';
import { ROUTES } from '../../../config/routes';
import { useAuth } from '../../../models/context/AuthContext';
import Avatar from '../common/Avatar/Avatar';
import Button from '../common/Button/Button';
import styles from './StudentLayout.module.css';

const MENU_ITEMS = [
  { path: ROUTES.STUDENT_DASHBOARD, label: 'Home', icon: Home },
  { path: ROUTES.AI_TUTOR, label: 'AI Tutor', icon: Bot },
  { path: ROUTES.MY_SYLLABUS, label: 'My Syllabus', icon: BookOpen },
  { path: ROUTES.NOTES, label: 'Notes', icon: FileText },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Temporary mock user if not logged in (so we can test easily)
  const currentUser = user || { name: 'John Doe', classId: '10', board: 'CBSE', email: 'student@example.com' };

  return (
    <div className={styles.layout}>
      {/* Sidebar for Desktop */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <nav className={styles.navSection}>
          {MENU_ITEMS.map((item) => {
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
            style={{ justifyContent: 'flex-start' }}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={styles.mainContainer}>
        {/* Sticky Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {MENU_ITEMS.find((item) => item.path === location.pathname)?.label || 'Study Wisely'}
          </div>

          <div className={styles.userInfo}>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--color-text-secondary)' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-error)' }} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span className={styles.userName}>{currentUser.name}</span>
                <span className={styles.userClass}>Class {currentUser.classId}th • {currentUser.board?.toUpperCase() || 'CBSE'}</span>
              </div>
              <Avatar name={currentUser.name} size="md" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className={styles.contentBody}>
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile */}
      <nav className={styles.bottomNav}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.bottomItem} ${isActive ? styles.bottomItemActive : ''}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default StudentLayout;
