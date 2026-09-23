import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { VehicleCategoryId } from '../../models/vehicle';
import { API_BASE_URL } from '../../config/api';
import styles from './FleetSection.module.css';

type VehicleContent = {
  id: string;
  vehicleCategory: VehicleCategoryId;
  title: string;
  description: string;
  imageUrls: string[];
  videoUrls: string[];
  active: boolean;
};

type FleetDefinition = {
  id: VehicleCategoryId;
  number: string;
  name: string;
  passengers: string;
  luggage: string;
  handCarry: string;
  models: string[];
  idealFor: string;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=85';

const fleet: FleetDefinition[] = [
  {
    id: 'saloon',
    number: '01',
    name: 'Saloon',
    passengers: 'Up to 3',
    luggage: 'Up to 2 suitcases',
    handCarry: 'Hand luggage',
    models: ['Tesla Model 3', 'Toyota Prius', 'Kia Niro', 'Hyundai Ioniq', 'Mitsubishi Outlander'],
    idealFor: 'Airport, railway & private journeys',
  },
  {
    id: 'estate',
    number: '02',
    name: 'Estate',
    passengers: 'Up to 3',
    luggage: 'Up to 4 suitcases',
    handCarry: 'Hand luggage',
    models: ['MG EV', 'Toyota Auris', 'Tesla Model S'],
    idealFor: 'Airport journeys with extra luggage',
  },
  {
    id: 'mpv',
    number: '03',
    name: 'MPV',
    passengers: 'Up to 5',
    luggage: 'Up to 4 suitcases',
    handCarry: 'Hand luggage',
    models: ['Mercedes V Class', 'Tesla Model X', 'Mercedes Viano'],
    idealFor: 'Families & small groups',
  },
  {
    id: 'executive',
    number: '04',
    name: 'Executive',
    passengers: 'Up to 3',
    luggage: 'Up to 3 suitcases',
    handCarry: 'Hand luggage',
    models: ['BMW 5 Series', 'Mercedes E Class', 'Tesla Model S'],
    idealFor: 'Business & executive travel',
  },
  {
    id: 'eight-seater',
    number: '05',
    name: '8-Seater',
    passengers: 'Up to 8',
    luggage: 'Up to 6 suitcases',
    handCarry: 'Hand luggage',
    models: ['VW Transporter', 'Mercedes Vito', 'Ford Tourneo'],
    idealFor: 'Large families, events & groups',
  },
];

export function FleetSection() {
  const [activeId, setActiveId] = useState<VehicleCategoryId>('saloon');
  const [content, setContent] = useState<VehicleContent[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE_URL}/content/vehicles`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load vehicle content');
        return response.json();
      })
      .then((data: VehicleContent[]) => {
        if (!cancelled) setContent(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setContent([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const active = useMemo(
    () => fleet.find((item) => item.id === activeId) ?? fleet[0],
    [activeId],
  );

  const activeContent = content.find(
    (item) => item.vehicleCategory === active.id,
  );

  const image = activeContent?.imageUrls?.[0] || FALLBACK_IMAGE;

  return (
    <section className={styles.section} aria-labelledby="fleet-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>PRIVATE FLEET</span>
            <h2 id="fleet-title">The right vehicle for the journey.</h2>
          </div>

          <p>
            Choose by passenger space, luggage capacity and the type of journey you are planning.
          </p>
        </div>

        <div className={styles.fleetShell}>
          <div className={styles.categoryRail}>
            {fleet.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.category} ${
                  active.id === item.id ? styles.categoryActive : ''
                }`}
                onClick={() => setActiveId(item.id)}
                aria-pressed={active.id === item.id}
              >
                <span className={styles.categoryNumber}>{item.number}</span>
                <span className={styles.categoryName}>{item.name}</span>
                <span className={styles.categoryCapacity}>{item.passengers}</span>
                <span className={styles.categoryArrow}>↗</span>
              </button>
            ))}
          </div>

          <div className={styles.vehiclePanel}>
            <div className={styles.imagePanel}>
              <img
                src={image}
                alt={activeContent?.title || `${active.name} vehicle`}
                loading="lazy"
                onError={(event) => {
                  const target = event.currentTarget;
                  if (target.src !== FALLBACK_IMAGE) {
                    target.src = FALLBACK_IMAGE;
                  }
                }}
              />

              <div className={styles.imageShade} />

              <div className={styles.imageMeta}>
                <span>VEHICLE {active.number}</span>
                <strong>{active.name}</strong>
              </div>
            </div>

            <div className={styles.contentPanel}>
              <div className={styles.topLine}>
                <span>SELECTED CATEGORY</span>
                <b>{active.number}</b>
              </div>

              <h3>{activeContent?.title || active.name}</h3>

              <p className={styles.description}>
                {activeContent?.description ||
                  `${active.name} private transport designed for ${active.idealFor.toLowerCase()}.`}
              </p>

              <div className={styles.specRow}>
                <div>
                  <span>PASSENGERS</span>
                  <strong>{active.passengers}</strong>
                </div>

                <div>
                  <span>SUITCASES</span>
                  <strong>{active.luggage}</strong>
                </div>

                <div>
                  <span>HAND CARRY</span>
                  <strong>{active.handCarry}</strong>
                </div>
              </div>

              <div className={styles.infoRow}>
                <div>
                  <span>EXAMPLE MODELS</span>
                  <div className={styles.modelTags}>
                    {active.models.map((model) => (
                      <em key={model}>{model}</em>
                    ))}
                  </div>
                </div>

                <div className={styles.suitable}>
                  <span>SUITABLE FOR</span>
                  <strong>{active.idealFor}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                <Link
                  to={`/vehicles/${active.id}`}
                  className={styles.detailsLink}
                >
                  Explore vehicle
                  <span>↗</span>
                </Link>

                <a href="#booking" className={styles.bookLink}>
                  Book this vehicle
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerLine}>
          <span>Airport transfers</span>
          <i />
          <span>Railway transfers</span>
          <i />
          <span>Cruise transfers</span>
          <i />
          <span>Event transport</span>
        </div>
      </div>
    </section>
  );
}
