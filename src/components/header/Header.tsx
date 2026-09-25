import { useState } from 'react';
import { Mail, Menu } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { PhoneContact } from './PhoneContact';
import { MobileNav } from './MobileNav';
import styles from './Header.module.css';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo />
        </div>

        <div className={styles.centerArea}>
          <div className={styles.companyName}>{siteConfig.websiteName}</div>
          <div className={styles.tagline}>Your Transport Company</div>
          <div className={styles.navigationShell}>
            <Navigation />
          </div>
        </div>

        <div className={styles.contactArea}>
          <a href='mailto:hello@ukairporttaxi.co.uk' className={styles.email}>
            <Mail size={14} strokeWidth={1.8} aria-hidden='true' />
            <span>hello@ukairporttaxi.co.uk</span>
          </a>
          <PhoneContact className={styles.phone} />
        </div>

        <button type='button' className={styles.menuButton} aria-label='Open menu' aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>
          <Menu size={22} strokeWidth={1.8} aria-hidden='true' />
        </button>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
