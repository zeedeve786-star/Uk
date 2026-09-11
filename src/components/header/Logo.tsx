import { siteConfig } from '../../config/site';
import styles from './Logo.module.css';

export function Logo() {
  if (siteConfig.logo.src) {
    return (
      <a href="#home" className={styles.logoLink} aria-label={siteConfig.websiteName}>
        <img src={siteConfig.logo.src} alt={siteConfig.logo.alt} className={styles.logoImg} />
      </a>
    );
  }

  return (
    <a href="#home" className={styles.logoLink} aria-label={siteConfig.websiteName}>
      <svg className={styles.logoMark} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="22" stroke="var(--color-ink)" strokeWidth="1.5" />
        <path d="M13 29.5 L17 18.5 H31 L35 29.5" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M13 29.5 H35" stroke="var(--color-ink)" strokeWidth="1.5" />
        <circle cx="18" cy="29.5" r="2" fill="var(--color-brass)" />
        <circle cx="30" cy="29.5" r="2" fill="var(--color-brass)" />
      </svg>
    </a>
  );
}