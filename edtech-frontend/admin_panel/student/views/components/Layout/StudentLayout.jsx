import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Home, LogOut, Settings, Bell, Bot, BookOpen, FileText } from 'lucide-react';
import Logo from '../../../../../src/views/components/common/Logo/Logo';
import { ROUTES } from '../../../../../src/config/routes';
import { useAuth } from '../../../../../src/models/context/AuthContext';
import Avatar from '../../../../../src/views/components/common/Avatar/Avatar';
import Button from '../../../../../src/views/components/common/Button/Button';
import styles from '../../../../../src/views/components/layout/StudentLayout.module.css';

const MENU_ITEMS = [
  { path: ROUTES.STUDENT_DASHBOARD, label: 'Home', icon: Home },
  { path: ROUTES.AI_TUTOR, label: 'AI Tutor', icon: Bot },
  { path: ROUTES.MY_SYLLABUS, label: 'My Syllabus', icon: BookOpen },
  { path: ROUTES.NOTES, label: 'Notes', icon: FileText },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

const StudentLayout = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock notifications data
  const [notifications, setNotifications] = useState([
    { id: 1, text: '🎉 You completed 75% of Mathematics syllabus!', time: '10 mins ago', read: false },
    { id: 2, text: '🤖 AI Tutor has resolved your doubt about Euclid\'s Lemma', time: '2 hours ago', read: false },
    { id: 3, text: '📝 Physics: New study notes uploaded for Chapter 2', time: 'Yesterday', read: true },
    { id: 4, text: '🔥 Streak Protected! Protect your 5-day streak today', time: '1 day ago', read: true }
  ]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Loading Student Portal...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user && user.role === 'admin') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  // Temporary mock user if not logged in
  const currentUser = user || { name: 'Aarav Sharma', classId: '10', board: 'CBSE', email: 'aarav.sharma@gmail.com' };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar for Desktop */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Link to="/" className={styles.logoLink}>
            <Logo className={styles.sidebarLogo} />
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
          {/* Mobile Logo (only visible on mobile screens) */}
          <div className={styles.mobileLogo}>
            <Link to="/" className={styles.logoLink}>
              <Logo />
            </Link>
          </div>

          <div className={styles.headerTitle}>
            {MENU_ITEMS.find((item) => item.path === location.pathname)?.label || 'Study Wisely'}
          </div>

          <div className={styles.userInfo} style={{ position: 'relative' }}>
            {/* Notification Bell Dropdown wrapper */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                style={{ 
                  position: 'relative', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-secondary)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: showNotifications ? 'var(--color-border-light)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--color-error)' 
                  }} />
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
                          style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer' }}
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
            
            {/* User Profile dropdown */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-3)', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-lg)',
                  background: showProfileMenu ? 'var(--color-border-light)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                <div className={styles.userMeta}>
                  <span className={styles.userName}>{currentUser.name}</span>
                  <span className={styles.userClass}>Class {currentUser.classId}th • {currentUser.board?.toUpperCase() || 'CBSE'}</span>
                </div>
                <Avatar name={currentUser.name} size="md" />
              </div>

              {showProfileMenu && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, cursor: 'default' }} 
                    onClick={() => setShowProfileMenu(false)} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '200px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px 0',
                    zIndex: 101,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border-light)', marginBottom: '4px' }}>
                      <p style={{ fontWeight: '700', fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>{currentUser.name}</p>
                      <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{currentUser.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(ROUTES.SETTINGS);
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px 16px', 
                        width: '100%', 
                        textAlign: 'left', 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Settings size={14} />
                      Account Settings
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px 16px', 
                        width: '100%', 
                        textAlign: 'left', 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 'none',
                        borderTop: '1px solid var(--color-border-light)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              )}
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

