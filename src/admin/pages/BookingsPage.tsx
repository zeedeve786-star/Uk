import { Link } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { bookingsApi } from '../api/adminService';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import styles from './BookingsPage.module.css';

export function BookingsPage() {
  const { data: bookings, status } = useAsyncData(() => bookingsApi.list(), []);

  if (status === 'loading') {
    return (
      <div className={styles.state}>
        <div className={styles.statePulse} />
        <span>Loading bookings…</span>
      </div>
    );
  }

  if (status === 'forbidden') {
    return <Alert tone="error">You do not have permission to manage bookings.</Alert>;
  }

  if (status === 'error') {
    return <Alert tone="error">Unable to load bookings.</Alert>;
  }

  const bookingRows = bookings ?? [];

  const confirmed = bookingRows.filter((b) => b.bookingStatus === 'CONFIRMED').length;
  const pending = bookingRows.filter((b) => b.bookingStatus !== 'CONFIRMED' && b.bookingStatus !== 'CANCELLED').length;
  const paid = bookingRows.filter((b) => b.paymentStatus === 'PAID').length;
  const cancelled = bookingRows.filter((b) => b.bookingStatus === 'CANCELLED').length;

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            OPERATIONS / BOOKINGS
          </div>
          <h1 className={styles.heading}>Booking Desk</h1>
          <p className={styles.description}>
            Monitor customer journeys, payment state and booking activity from one operational view.
          </p>
        </div>

        <div className={styles.heroMeta}>
          <span className={styles.heroMetaLabel}>TOTAL BOOKINGS</span>
          <strong>{bookingRows.length}</strong>
          <span className={styles.heroMetaCaption}>live records</span>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.summaryPrimary}`}>
          <span>CONFIRMED</span>
          <strong>{confirmed}</strong>
          <small>Active customer bookings</small>
        </div>

        <div className={styles.summaryCard}>
          <span>PAID</span>
          <strong>{paid}</strong>
          <small>Payment completed</small>
        </div>

        <div className={styles.summaryCard}>
          <span>PENDING</span>
          <strong>{pending}</strong>
          <small>Awaiting final state</small>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryMuted}`}>
          <span>CANCELLED</span>
          <strong>{cancelled}</strong>
          <small>Cancelled bookings</small>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <div>
            <span className={styles.workspaceKicker}>BOOKING REGISTER</span>
            <h2>All customer journeys</h2>
          </div>

          <div className={styles.workspaceIndicator}>
            <span />
            <strong>LIVE DATA</strong>
          </div>
        </div>

        <div className={styles.bookingList}>
          {bookingRows.length === 0 ? (
            <div className={styles.emptyBooking}>
              <span>NO BOOKINGS</span>
              <strong>No customer journeys yet.</strong>
            </div>
          ) : (
            bookingRows.map((b) => {
              const statusClass =
                b.bookingStatus === 'CONFIRMED'
                  ? styles.statusConfirmed
                  : b.bookingStatus === 'CANCELLED'
                    ? styles.statusCancelled
                    : styles.statusPending;

              return (
                <details className={styles.bookingItem} key={b.id}>
                  <summary className={styles.bookingSummary}>
                    <div className={styles.bookingMain}>
                      <div className={styles.rideId}>
                        <small>RIDE ID</small>
                        <strong>{b.bookingReference}</strong>
                      </div>

                      <div className={styles.customerMain}>
                        <span className={styles.customerAvatar}>
                          {b.customerName?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                        <div>
                          <small>CUSTOMER</small>
                          <strong>{b.customerName}</strong>
                        </div>
                      </div>

                      <div className={styles.locationMain}>
                        <small>PICKUP</small>
                        <strong>{b.pickup}</strong>
                      </div>

                      <div className={styles.routeArrow}>→</div>

                      <div className={styles.locationMain}>
                        <small>DROP-OFF</small>
                        <strong>{b.destination}</strong>
                      </div>
                    </div>

                    <div className={`${styles.statusPopup} ${statusClass}`}>
                      <span className={styles.statusDot} />
                      <div>
                        <small>RIDE STATUS</small>
                        <strong>{b.bookingStatus}</strong>
                      </div>
                      <span className={styles.expandArrow}>⌄</span>
                    </div>
                  </summary>

                  <div className={styles.bookingDetails}>
                    <div className={styles.detailItem}>
                      <small>JOURNEY DATE</small>
                      <strong>{b.journeyDate}</strong>
                    </div>

                    <div className={styles.detailItem}>
                      <small>PICKUP TIME</small>
                      <strong>{b.journeyTime}</strong>
                    </div>

                    <div className={styles.detailItem}>
                      <small>FARE</small>
                      <strong>£{(b.finalFarePence / 100).toFixed(2)}</strong>
                    </div>

                    <div className={styles.detailItem}>
                      <small>PAYMENT</small>
                      <Badge
                        tone={
                          b.paymentStatus === 'PAID'
                            ? 'success'
                            : b.paymentStatus === 'FAILED'
                              ? 'danger'
                              : 'neutral'
                        }
                      >
                        {b.paymentStatus}
                      </Badge>
                    </div>

                    <div className={styles.detailItem}>
                      <small>PASSENGERS</small>
                      <strong>—</strong>
                    </div>

                    <Link
                      className={styles.detailAction}
                      to={`/admin/bookings/${b.bookingReference}`}
                    >
                      OPEN RIDE <span>→</span>
                    </Link>
                  </div>
                </details>
              );
            })
          )}
        </div>

        <div className={styles.workspaceFooter}>
          <span>Booking records are loaded directly from the transport platform.</span>
          <strong>{bookingRows.length} RECORDS</strong>
        </div>
      </div>
    </section>
  );
}
