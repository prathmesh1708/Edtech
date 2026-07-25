import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LogOut, BookOpen, Settings, Bell, Bot, FileText, X } from 'lucide-react';
import Logo from '../common/Logo/Logo';
import { ROUTES } from '../../../config/routes';
import { useAuth } from '../../../models/context/AuthContext';
import Avatar from '../common/Avatar/Avatar';
import Button from '../common/Button/Button';
import { API_BASE_URL } from '../../../config/constants';
import styles from './StudentLayout.module.css';

const MENU_ITEMS = [
  { path: ROUTES.STUDENT_DASHBOARD, label: 'Home', icon: Home },
  { path: ROUTES.MY_SYLLABUS, label: 'My Syllabus', icon: BookOpen },
  { path: ROUTES.NOTES, label: 'Notes', icon: FileText },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const currentUser = user || { name: 'John Doe', classId: '10', board: 'CBSE', email: 'student@example.com' };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = user?._id || '';
        const role = user?.role || 'student';
        const res = await fetch(`${API_BASE_URL}/notifications/user?role=${role}&userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching student notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?._id }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?._id }),
      });
    } catch (err) {
      console.error(err);
    }
  };

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
            onClick={handleLogout}
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
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--color-text-secondary)' }}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-error)' }} />
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, cursor: 'default' }} 
                    onClick={() => setShowNotifications(false)} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '320px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 'var(--space-4)',
                    zIndex: 101,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllRead} 
                          style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer', background: 'none', border: 'none' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)', padding: '16px 0' }}>
                          No notifications
                        </p>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => toggleRead(n.id)}
                            style={{ 
                              padding: '8px 12px', 
                              borderRadius: 'var(--radius-md)', 
                              background: n.read ? 'transparent' : 'var(--color-bg)', 
                              cursor: 'pointer',
                              borderLeft: n.read ? '3px solid transparent' : '3px solid var(--color-accent)',
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px'
                            }}
                          >
                            <p style={{ 
                              fontSize: 'var(--text-xs)', 
                              fontWeight: n.read ? '400' : '600', 
                              color: 'var(--color-text-primary)',
                              lineHeight: '1.4'
                            }}>
                              {n.text}
                            </p>
                            <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
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
