import { siteConfig } from '../config/site';
import styles from './PromotionalTicker.module.css';

function TickerItem({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <span className={`${styles.item} ${duplicate ? styles.duplicate : ''}`} aria-hidden={duplicate || undefined}>
      <svg className={styles.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 13 L13 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7.6" cy="7.6" r="1.1" fill="currentColor" />
        <circle cx="12.4" cy="12.4" r="1.1" fill="currentColor" />
      </svg>
      {siteConfig.promotionMessage}
    </span>
  );
}

export function PromotionalTicker() {
  return (
    <div className={styles.ticker} role="region" aria-label="Promotional offer">
      <div className={styles.track}>
        <TickerItem />
        <TickerItem duplicate />
        <TickerItem duplicate />
        <TickerItem duplicate />
      </div>
    </div>
  );
}