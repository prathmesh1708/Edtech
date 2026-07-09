import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Video, MessageCircle, Briefcase } from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION, FOOTER_LINKS, SOCIAL_LINKS } from '../../../../config/constants';
import styles from './Footer.module.css';

const SOCIAL_ICONS = { Instagram: Globe, Youtube: Video, Twitter: MessageCircle, Linkedin: Briefcase };

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <img src="/assets/images/logo.png" alt={APP_NAME} />
            <p className={styles.brandDesc}>{APP_DESCRIPTION}</p>
            <div className={styles.social}>
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon] || Instagram;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Company</h4>
            <div className={styles.columnLinks}>
              {FOOTER_LINKS.company.map((link) => (
                <Link key={link.path} to={link.path} className={styles.columnLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Resources</h4>
            <div className={styles.columnLinks}>
              {FOOTER_LINKS.resources.map((link) => (
                <Link key={link.path + link.label} to={link.path} className={styles.columnLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Boards */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Boards</h4>
            <div className={styles.columnLinks}>
              {FOOTER_LINKS.boards.map((link) => (
                <Link key={link.path} to={link.path} className={styles.columnLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            {FOOTER_LINKS.legal.map((link) => (
              <Link key={link.path} to={link.path} className={styles.bottomLink}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
