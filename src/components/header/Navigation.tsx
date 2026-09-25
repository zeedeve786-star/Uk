import { siteConfig } from '../../config/site';
import { ServicesMenu } from './ServicesMenu';
import styles from './Navigation.module.css';

export function Navigation() {
  return (
    <nav className={styles.nav} aria-label='Primary'>
      <ul className={styles.list}>
        <li><a href={siteConfig.navigation.home.href} className={styles.link}>{siteConfig.navigation.home.label}</a></li>
        <li><ServicesMenu /></li>
        <li><a href={siteConfig.navigation.contact.href} className={styles.link}>{siteConfig.navigation.contact.label}</a></li>
        <li><a href='#about' className={styles.link}>ABOUT US</a></li>
      </ul>
    </nav>
  );
}
