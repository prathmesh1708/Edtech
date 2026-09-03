import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import { Menu, X } from 'lucide-react';
import Logo from '../../common/Logo/Logo';
import { NAV_LINKS } from '../../../../config/constants';
import { ROUTES } from '../../../../config/routes';
import Button from '../../common/Button/Button';
import { useTheme } from '../../../../models/context/ThemeContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.solid : styles.transparent}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <Logo dark={theme === 'dark'} />
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className={styles.actions}>
          <button
            onClick={toggleTheme}
            className={styles.desktopThemeBtn}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm" iconLeft={<LogIn size={16} />}>
              Login
            </Button>
          </Link>
          <Link to={`${ROUTES.SELECT_CLASS}?mode=register`}>
            <Button variant="primary" size="sm" iconLeft={<UserPlus size={16} />}>
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.menuBtn}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}>
            <span />
            <span />
            <span />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ''}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`${styles.mobileNavLink} ${location.pathname === link.path ? styles.active : ''}`}
          >
            {link.label}
          </Link>
        ))}

        {/* Theme Selector Section */}
        <div className={styles.themeSection}>
          <span className={styles.themeLabel}>Theme Selection</span>
          <div className={styles.themeButtons}>
            <button
              onClick={() => setTheme('light')}
              className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
            >
              <Sun size={16} />
              <span>Light Theme</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
            >
              <Moon size={16} />
              <span>Dark Theme</span>
            </button>
          </div>
        </div>

        <div className={styles.mobileActions}>
          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary" fullWidth iconLeft={<LogIn size={18} />}>
              Login
            </Button>
          </Link>
          <Link to={`${ROUTES.SELECT_CLASS}?mode=register`}>
            <Button variant="primary" fullWidth iconLeft={<UserPlus size={18} />}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
