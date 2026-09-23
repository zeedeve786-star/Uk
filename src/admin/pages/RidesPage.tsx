import { useNavigate } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { ridesApi } from '../api/rideService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import type { RideStatus } from '../models';
import styles from './RidesPage.module.css';

function statusTone(status: RideStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'IN_PROGRESS') return 'warning';
  if (status === 'CANCELLED') return 'danger';
  return 'neutral';
}

export function RidesPage() {
  const navigate = useNavigate();
  const { data: rides, status } = useAsyncData(() => ridesApi.list(), []);

  if (status === 'loading') {
    return <Card><p>Loading rides...</p></Card>;
  }

  if (status === 'error') {
    return <Alert tone="error">Unable to load rides.</Alert>;
  }

  return (
    <div>
      <h1 className={styles.heading}>Rides</h1>

      {!rides?.length ? (
        <Card>
          <p className={styles.empty}>No rides found.</p>
        </Card>
      ) : (
        <Card>
          <div className={styles.list}>
            {rides.map((ride) => (
              <div className={styles.row} key={ride.id}>
                <div className={styles.main}>
                  <div className={styles.reference}>{ride.rideReference}</div>
                  <div className={styles.route}>
                    {ride.booking.pickup} → {ride.booking.destination}
                  </div>
                  <div className={styles.meta}>
                    {ride.booking.journeyDate} · {ride.booking.journeyTime} · {ride.booking.vehicleCategory}
                  </div>
                </div>

                <div className={styles.side}>
                  <Badge tone={statusTone(ride.status)}>{ride.status}</Badge>
                  <span className={styles.customer}>{ride.booking.customerName}</span>
                  <Button
                    type="button"
                    onClick={() => navigate(`/admin/rides/${ride.rideReference}`)}
                  >
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
