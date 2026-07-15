import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../../../../src/views/components/common/Logo/Logo';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  Bell, 
  Image, 
  LogOut,
  GraduationCap,
  CreditCard,
  User,
  Cpu
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { name: 'Syllabus & Content', path: '/admin/content', icon: BookOpen },
    { name: 'Banners', path: '/admin/banners', icon: Image },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'My Profile', path: '/admin/profile', icon: User },
    { name: 'System Settings', path: '/admin/system-settings', icon: Cpu },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Logo className={styles.sidebarLogo} />
      </div>
      
      <div className={styles.navSection}>
        <span className={styles.navSectionTitle}>CORE MANAGEMENT</span>
      </div>
      
      <nav className={styles.navContainer}>
        <ul className={styles.navList}>
          {navItems.map((item, index) => (
            <li key={index} className={styles.navItem}>
              <NavLink 
                to={item.path} 
                end={item.path === '/admin'}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                <item.icon className={styles.navIcon} size={20} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton}>
          <LogOut size={20} className={styles.logoutIcon} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
