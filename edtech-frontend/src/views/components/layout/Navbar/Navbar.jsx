import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { Menu, X } from 'lucide-react';
import Logo from '../../common/Logo/Logo';
import { NAV_LINKS } from '../../../../config/constants';
import { ROUTES } from '../../../../config/routes';
import Button from '../../common/Button/Button';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
          <Logo />
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
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm" iconLeft={<LogIn size={16} />}>
              Login
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
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
        <div className={styles.mobileActions}>
          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary" fullWidth iconLeft={<LogIn size={18} />}>
              Login
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
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
