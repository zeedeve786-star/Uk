import { footerColumns, footerContact } from '../../config/footer';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <a href='#home' className={styles.logo}>UK<span>TRANSPORT</span></a>
            <p>Private airport transfers and journeys across England.</p>
            <a href='#booking' className={styles.bookLink}>Book your journey <span>→</span></a>
          </div>

          <div className={styles.columns}>
            {footerColumns.map((column) => (
              <div key={column.title} className={styles.column}>
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={styles.contact}>
            <span className={styles.contactLabel}>GET IN TOUCH</span>
            <a href={`tel:${footerContact.phoneTel}`} className={styles.phone}>
              {footerContact.phoneDisplay}
            </a>
            <a href={`tel:${footerContact.phoneTel}`} className={styles.email}>
              {footerContact.email}
            </a>
            <div className={styles.social}>
              {footerContact.social.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} UK Transport. All rights reserved.</span>
          <span>Private transport across England</span>
          <a href='#faqs'>FAQs <span>↗</span></a>
        </div>
      </div>
    </footer>
  );
}
