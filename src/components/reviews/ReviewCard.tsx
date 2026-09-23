import type { Review } from '../../models/review';
import styles from './ReviewCard.module.css';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.rating} aria-label={`${review.rating} out of 5 stars`}>
        {'★'.repeat(review.rating)}
      </div>
      <p className={styles.text}>{review.text}</p>
      <div className={styles.meta}>
        <strong className={styles.name}>{review.name}</strong>
        <span className={styles.category}>{review.category}</span>
      </div>
    </article>
  );
}
