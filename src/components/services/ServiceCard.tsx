import type { ServiceContent } from '../../config/services';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  service: ServiceContent;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className={styles.card} id={service.href.replace('#', '')}>
      <span className={styles.label}>{service.referenceLabel}</span>
      <h3 className={styles.title}>{service.label}</h3>
      <p className={styles.summary}>{service.summary}</p>
      <a href="#home" className={styles.link}>Start a booking</a>
    </article>
  );
}
