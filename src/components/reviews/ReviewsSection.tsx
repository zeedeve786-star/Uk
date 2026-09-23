import { demoReviews } from '../../config/reviews';
import { ReviewCard } from './ReviewCard';
import styles from './ReviewsSection.module.css';

export function ReviewsSection() {
  const approvedReviews = demoReviews.filter((review) => review.approved);

  return (
    <section className={styles.section} aria-label="Customer reviews">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Customer reviews</h2>
        <p className={styles.intro}>
          A selection of customer feedback. Published reviews are shown only after approval.
        </p>
        <div className={styles.grid}>
          {approvedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
