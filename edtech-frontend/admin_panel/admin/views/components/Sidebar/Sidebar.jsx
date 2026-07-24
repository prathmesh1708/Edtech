import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../../../../src/views/components/common/Logo/Logo';
import { useAuth } from '../../../../../src/models/context/AuthContext';
import { ROUTES } from '../../../../../src/config/routes';
import { 
  LayoutDashboard, 
  BarChart3,
  Users, 
  BookOpen, 
  Settings, 
  Bell, 
  Image, 
  LogOut,
  GraduationCap,
  CreditCard,
  User,
  Cpu,
  ChevronDown,
  ChevronRight,
  Globe,
  Award,
  Layers,
  ListOrdered,
  CheckSquare,
  FileText
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSyllabusPath = location.pathname.startsWith('/admin/syllabus') || location.pathname.startsWith('/admin/content');
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(isSyllabusPath);

  useEffect(() => {
    if (isSyllabusPath) {
      setIsSyllabusOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Educational Insights', path: '/admin/educational-insights', icon: GraduationCap },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    
    // Collapsible Parent Menu: Syllabus & Content
    {
      name: 'Syllabus & Content',
      icon: BookOpen,
      isParent: true,
      subItems: [
        { name: 'Global Syllabus Management', path: ROUTES.ADMIN_SYLLABUS_GLOBAL, icon: Globe },
        { name: 'Board-wise Syllabus Management', path: ROUTES.ADMIN_SYLLABUS_BOARD, icon: Award },
        { name: 'Subject Management', path: ROUTES.ADMIN_SYLLABUS_SUBJECTS, icon: Layers },
        { name: 'Chapter Management', path: ROUTES.ADMIN_SYLLABUS_CHAPTERS, icon: ListOrdered },
        { name: 'Content Approval System', path: ROUTES.ADMIN_SYLLABUS_APPROVAL, icon: CheckSquare },
        { name: 'Educational Material Organization', path: ROUTES.ADMIN_SYLLABUS_MATERIALS, icon: FileText }
      ]
    },

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
          {navItems.map((item, index) => {
            if (item.isParent) {
              return (
                <li key={index} className={styles.navItem}>
                  <button 
                    type="button"
                    className={`${styles.navLink} ${isSyllabusPath ? styles.parentActive : ''}`}
                    onClick={() => setIsSyllabusOpen(!isSyllabusOpen)}
                  >
                    <item.icon className={styles.navIcon} size={20} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
                    {isSyllabusOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {isSyllabusOpen && (
                    <ul className={styles.subMenuNav}>
                      {item.subItems.map((sub, sIdx) => (
                        <li key={sIdx}>
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) =>
                              isActive ? `${styles.subNavLink} ${styles.subActive}` : styles.subNavLink
                            }
                          >
                            <sub.icon size={16} />
                            <span>{sub.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
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
            );
          })}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={20} className={styles.logoutIcon} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
