import { Phone } from 'lucide-react';
import { siteConfig } from '../../config/site';
import styles from './PhoneContact.module.css';

export function PhoneContact({ className }: { className?: string }) {
  return (
    <a href={`tel:${siteConfig.phoneNumber.tel}`} className={[styles.phone, className].filter(Boolean).join(' ')}>
      <Phone size={14} className={styles.icon} aria-hidden="true" />
      <span>{siteConfig.phoneNumber.display}</span>
    </a>)
}