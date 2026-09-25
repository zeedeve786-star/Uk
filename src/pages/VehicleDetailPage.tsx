import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { VehicleCategoryId } from '../models/vehicle';
import { vehicleCatalog } from '../config/vehicles';
import { API_BASE_URL } from '../config/api';

type VehicleContent = {
  id: string;
  vehicleCategory: VehicleCategoryId;
  title: string;
  description: string;
  imageUrls: string[];
  videoUrls: string[];
  active: boolean;
};

const definitions = Object.fromEntries(
  vehicleCatalog.map((vehicle) => [
    vehicle.id,
    {
      name: vehicle.name.replace(' Car', ''),
      passengers: `Up to ${vehicle.passengerCapacity} passengers`,
      luggage: `Up to ${vehicle.luggageCapacity} suitcases`,
      handCarry: `Up to ${vehicle.handCarryCapacity} hand-carry items`,
    },
  ]),
) as Record<
  VehicleCategoryId,
  {
    name: string;
    passengers: string;
    luggage: string;
    handCarry: string;
  }
>;

export function VehicleDetailPage() {
  const { category } = useParams<{ category: string }>();
  const [entries, setEntries] = useState<VehicleContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/content/vehicles`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load vehicle content');
        return response.json();
      })
      .then((data: VehicleContent[]) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const key = category as VehicleCategoryId;
  const definition = definitions[key];

  if (!definition) {
    return (
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <h1>Vehicle not found</h1>
        <Link to="/">Return to home</Link>
      </main>
    );
  }

  const content = entries.find((entry) => entry.vehicleCategory === key);
  const image = content?.imageUrls?.[0];

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '54px 20px 80px',
        background: '#f8faff',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Link
          to="/"
          style={{
            color: '#5967b5',
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          ← Back to fleet
        </Link>

        <div
          style={{
            marginTop: 18,
            overflow: 'hidden',
            borderRadius: 24,
            background: '#fff',
            border: '1px solid rgba(75,94,163,.12)',
            boxShadow: '0 24px 70px rgba(50,67,126,.10)',
          }}
        >
          {image && (
            <img
              src={image}
              alt={content?.title || definition.name}
              style={{
                width: '100%',
                height: 420,
                display: 'block',
                objectFit: 'cover',
              }}
            />
          )}

          <div style={{ padding: '34px 36px 38px' }}>
            <span
              style={{
                fontSize: 9,
                letterSpacing: '.17em',
                fontWeight: 850,
                color: '#727dbb',
              }}
            >
              VEHICLE CATEGORY
            </span>

            <h1
              style={{
                margin: '10px 0 12px',
                color: '#19223d',
                fontSize: 'clamp(32px, 5vw, 52px)',
                letterSpacing: '-.045em',
              }}
            >
              {content?.title || definition.name}
            </h1>

            <p
              style={{
                maxWidth: 760,
                color: '#69748c',
                lineHeight: 1.75,
                fontSize: 14,
              }}
            >
              {content?.description ||
                `${definition.name} private transport for your planned journey.`}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12,
                marginTop: 26,
              }}
            >
              <div style={{ padding: 16, borderRadius: 14, background: '#f5f7fd' }}>
                <small style={{ color: '#8b94aa' }}>PASSENGERS</small>
                <strong style={{ display: 'block', marginTop: 5, color: '#303a57' }}>
                  {definition.passengers}
                </strong>
              </div>

              <div style={{ padding: 16, borderRadius: 14, background: '#f5f7fd' }}>
                <small style={{ color: '#8b94aa' }}>LUGGAGE</small>
                <strong style={{ display: 'block', marginTop: 5, color: '#303a57' }}>
                  {definition.luggage}
                </strong>
              </div>

              <div style={{ padding: 16, borderRadius: 14, background: '#f5f7fd' }}>
                <small style={{ color: '#8b94aa' }}>HAND CARRY</small>
                <strong style={{ display: 'block', marginTop: 5, color: '#303a57' }}>
                  {definition.handCarry}
                </strong>
              </div>
            </div>

            {loading && (
              <p style={{ marginTop: 20, color: '#8b94aa', fontSize: 12 }}>
                Loading vehicle content…
              </p>
            )}

            <a
              href="/#booking"
              style={{
                display: 'inline-flex',
                marginTop: 28,
                minHeight: 42,
                alignItems: 'center',
                padding: '0 17px',
                borderRadius: 11,
                color: '#fff',
                background: 'linear-gradient(135deg,#566bd7,#765bd0)',
                textDecoration: 'none',
                fontSize: 11,
                fontWeight: 850,
              }}
            >
              Book this vehicle →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
