import { useState } from 'react';
import { Menu } from 'lucide-react';
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
        <Logo />

        <div className={styles.right}>
          <span className={styles.name}>{siteConfig.websiteName}</span>
          <Navigation />
          <PhoneContact className={styles.phone} />
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}