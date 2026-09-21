import styles from './HowItWorksSection.module.css';

const steps = [
  {
    number: '01',
    title: 'Enter your journey',
    description: 'Choose your pickup, destination, date and travel time.',
  },
  {
    number: '02',
    title: 'Choose your vehicle',
    description: 'Select the vehicle that best suits your passengers and luggage.',
  },
  {
    number: '03',
    title: 'Confirm your booking',
    description: 'Review your journey details and complete your booking securely.',
  },
];

export function HowItWorksSection() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.inner}>
        <div className={styles.headingBlock}>
          <span className={styles.eyebrow}>Simple booking process</span>
          <h2 className={styles.heading}>How it works</h2>
          <p className={styles.intro}>
            Book your airport transfer in a few simple steps.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step) => (
            <article key={step.number} className={styles.step}>
              <span className={styles.number}>{step.number}</span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.description}>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
