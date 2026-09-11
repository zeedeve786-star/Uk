import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { PhoneContact } from './PhoneContact';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <div
      className={styles.panel}
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      hidden={!open}
    >
      <div className={styles.header}>
        <span className={styles.title}>{siteConfig.websiteName}</span>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav aria-label="Primary">
        <ul className={styles.list}>
          <li>
            <a href={siteConfig.navigation.home.href} className={styles.link} onClick={onClose}>
              {siteConfig.navigation.home.label}
            </a>
          </li>

          <li>
            <button
              type="button"
              className={styles.accordionTrigger}
              aria-expanded={servicesOpen}
              aria-controls="mobile-services-panel"
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services
              <ChevronDown size={16} style={{ transform: servicesOpen ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
            </button>
            <ul id="mobile-services-panel" className={styles.subList} hidden={!servicesOpen}>
              {siteConfig.services.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className={styles.subLink} onClick={onClose}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li>
            <a href={siteConfig.navigation.contact.href} className={styles.link} onClick={onClose}>
              {siteConfig.navigation.contact.label}
            </a>
          </li>
        </ul>
      </nav>

      <PhoneContact className={styles.phone} />
    </div>
  );
}