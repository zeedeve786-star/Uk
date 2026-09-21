import { useEffect, useState } from 'react';
import styles from './HowItWorksSection.module.css';

const steps = [
  {
    number: '01',
    title: 'Plan your journey',
    description: 'Enter your pickup, destination, date and travel time.',
  },
  {
    number: '02',
    title: 'Choose your vehicle',
    description: 'Select the vehicle that fits your passengers and luggage.',
  },
  {
    number: '03',
    title: 'Review your ride',
    description: 'Check your journey details and fare before booking.',
  },
  {
    number: '04',
    title: 'Ready to travel',
    description: 'Your private transfer is confirmed and ready to go.',
  },
];

const travelPoints = [
  { x: 7, y: 77, angle: -8 },
  { x: 13, y: 69, angle: -28 },
  { x: 16, y: 57, angle: -15 },
  { x: 19, y: 47, angle: -8 },
  { x: 25, y: 41, angle: 2 },
  { x: 32, y: 39, angle: 16 },
  { x: 38, y: 49, angle: 31 },
  { x: 44, y: 63, angle: 16 },
  { x: 51, y: 65, angle: -10 },
  { x: 56, y: 53, angle: -27 },
  { x: 58, y: 38, angle: -12 },
  { x: 65, y: 31, angle: 8 },
  { x: 72, y: 35, angle: 18 },
  { x: 76, y: 47, angle: 24 },
  { x: 79, y: 60, angle: 8 },
  { x: 84, y: 48, angle: -26 },
  { x: 88, y: 34, angle: -22 },
  { x: 92.5, y: 21.25, angle: -35 },
];

const routePath = `M70 310
  C170 270 145 185 245 160
  C340 137 350 280 455 260
  C555 241 548 110 655 125
  C750 139 760 245 925 85`;

export function HowItWorksSection() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 8500;
    const pause = 1800;
    const started = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const elapsed = now - started;
      const cycle = duration + pause;
      const cycleTime = elapsed % cycle;

      if (cycleTime >= duration) {
        setProgress(1);
      } else {
        const raw = cycleTime / duration;

        const eased =
          raw < 0.5
            ? 4 * raw * raw * raw
            : 1 - Math.pow(-2 * raw + 2, 3) / 2;

        setProgress(eased);
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  const scaled = progress * (travelPoints.length - 1);
  const index = Math.min(
    Math.floor(scaled),
    travelPoints.length - 2,
  );

  const localProgress = scaled - index;
  const current = travelPoints[index];
  const next = travelPoints[index + 1];

  const carX =
    current.x + (next.x - current.x) * localProgress;

  const carY =
    current.y + (next.y - current.y) * localProgress;

  const carAngle =
    current.angle +
    (next.angle - current.angle) * localProgress;

  const activeStep = Math.min(
    Math.floor(progress * 4),
    3,
  );

  const routeProgress = progress * 100;

  return (
    <section
      className={styles.section}
      id="how-it-works"
    >
      <div className={styles.inner}>
        <div className={styles.headingBlock}>
          <span className={styles.eyebrow}>
            Simple booking process
          </span>

          <h2 className={styles.heading}>
            How it works
          </h2>

          <p className={styles.intro}>
            Watch your journey move from pickup to destination.
          </p>
        </div>

        <div className={styles.journey}>
          <img
            className={styles.mapBackground}
            src="/maps/uk-motorways-map.svg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />

          <div className={styles.mapTint} />

          <div className={styles.mapHeader}>
            <span className={styles.mapLabel}>
              UK JOURNEY
            </span>

            <span className={styles.liveStatus}>
              <i />
              Journey in motion
            </span>
          </div>

          <div className={styles.locationPinPickup}>
            <span className={styles.pinDot} />
            <span>Pickup</span>
          </div>

          <div className={styles.locationPinDestination}>
            <span className={styles.pinDot} />
            <span>Destination</span>
          </div>

          <svg
            className={styles.routeSvg}
            viewBox="0 0 1000 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className={styles.routeShadow}
              d={routePath}
            />

            <path
              className={styles.routeBase}
              d={routePath}
            />

            <path
              className={styles.routeProgress}
              d={routePath}
              pathLength="100"
              style={{
                strokeDashoffset: `${100 - routeProgress}`,
              }}
            />
          </svg>

          <div
            className={styles.carScene}
            style={{
              left: `${carX}%`,
              top: `${carY}%`,
              transform: `translate(-50%, -50%) rotate(${carAngle}deg)`,
            }}
          >
            <div className={styles.carGlow} />

            <div className={styles.carBody}>
              <span className={styles.carRoof} />
              <span className={styles.carWindowFront} />
              <span className={styles.carWindowRear} />
              <span className={styles.carLightFront} />
              <span className={styles.carLightRear} />
              <span className={styles.carWheelFront} />
              <span className={styles.carWheelRear} />
            </div>

            <span className={styles.travelTrail} />
          </div>

          <div className={styles.bottomPanel}>
            <div className={styles.currentStep}>
              <span className={styles.stepNumber}>
                {steps[activeStep].number}
              </span>

              <div>
                <strong>
                  {steps[activeStep].title}
                </strong>

                <span>
                  {steps[activeStep].description}
                </span>
              </div>
            </div>

            <div className={styles.progressTrack}>
              <span
                className={styles.progressFill}
                style={{
                  width: `${routeProgress}%`,
                }}
              />
            </div>

            <div className={styles.stepCards}>
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`${styles.stepCard} ${
                    index === activeStep
                      ? styles.stepCardActive
                      : ''
                  }`}
                >
                  <strong>{step.title}</strong>
                  <span>{step.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
