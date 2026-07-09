import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, BookOpen, MessageSquare, User } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import { useAuth } from '../../../../models/context/AuthContext';
import styles from './PublicBottomNav.module.css';

const PublicBottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getProfileLink = () => {
    if (!user) return ROUTES.LOGIN;
    if (user.role === 'admin') return ROUTES.ADMIN_DASHBOARD;
    return ROUTES.STUDENT_DASHBOARD;
  };

  const navItems = [
    { path: ROUTES.HOME, label: 'Home', icon: Home },
    { path: ROUTES.COURSES, label: 'Courses', icon: LayoutGrid },
    { path: ROUTES.SYLLABUS, label: 'Syllabus', icon: BookOpen },
    { path: ROUTES.CONTACT, label: 'Contact', icon: MessageSquare },
    { path: getProfileLink(), label: user ? 'Portal' : 'Login', icon: User },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.path === ROUTES.HOME
          ? location.pathname === ROUTES.HOME
          : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.bottomItem} ${isActive ? styles.bottomItemActive : ''}`}
          >
            <Icon size={22} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default PublicBottomNav;
