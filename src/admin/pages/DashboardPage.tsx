import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Gauge,
  MapPin,
  Users,
} from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import { bookingsApi } from '../api/adminService';
import { Alert } from '../ui/Alert';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { data: bookings, status } = useAsyncData(() => bookingsApi.list(), []);

  const totalCount = bookings?.length ?? 0;
  const pendingCount =
    bookings?.filter((b) => b.bookingStatus === 'PENDING').length ?? 0;
  const paidCount =
    bookings?.filter((b) => b.paymentStatus === 'PAID').length ?? 0;
  const completedCount =
    bookings?.filter((b) => b.bookingStatus === 'COMPLETED').length ?? 0;

  const paidRate = totalCount
    ? Math.round((paidCount / totalCount) * 100)
    : 0;

  const completedRate = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const go = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />

      <header className={styles.hero}>
        <div className={styles.heroIdentity}>
          <div className={styles.commandMark}>
            <span />
            <span />
            <span />
          </div>

          <div>
            <div className={styles.eyebrow}>
              TRANSPORT COMMAND / LIVE NETWORK
            </div>

            <h1>
              Everything
              <span> in motion.</span>
            </h1>

            <p>
              A live operational view of your entire transport platform.
            </p>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.liveStatus}>
            <span className={styles.liveOrb} />
            <div>
              <small>PLATFORM</small>
              <strong>Operational</strong>
            </div>
          </div>

          <button
            className={styles.heroButton}
            onClick={() => go('/admin/bookings')}
          >
            Open operations
            <ArrowUpRight size={16} />
          </button>
        </div>
      </header>

      {status === 'loading' && (
        <div className={styles.loading}>
          <Activity size={16} />
          Loading live operational data…
        </div>
      )}

      {status === 'forbidden' && (
        <Alert tone="error">
          You do not have permission to view booking data.
        </Alert>
      )}

      {status === 'error' && (
        <Alert tone="error">
          Unable to load dashboard data.
        </Alert>
      )}

      {status === 'success' && (
        <main className={styles.dashboard}>
          <section className={styles.metricLayer}>
            <div className={styles.layerCaption}>
              <span>01</span>
              <strong>LIVE OVERVIEW</strong>
              <i />
              <small>KEY NETWORK SIGNALS</small>
            </div>

            <div className={styles.metricDeck}>
              <button
                className={`${styles.metric} ${styles.metricPrimary}`}
                onClick={() => go('/admin/rides')}
              >
                <div className={styles.metricTop}>
                  <span>TOTAL RIDES</span>
                  <div>
                    <Car size={17} />
                  </div>
                </div>

                <strong>{totalCount}</strong>

                <p>
                  <span>Platform volume</span>
                  <ArrowRight size={14} />
                </p>

                <div className={styles.metricAccent} />
              </button>

              <button
                className={styles.metric}
                onClick={() => go('/admin/bookings')}
              >
                <div className={styles.metricTop}>
                  <span>PENDING</span>
                  <div>
                    <Clock3 size={17} />
                  </div>
                </div>

                <strong>{pendingCount}</strong>

                <p>
                  <span>Needs attention</span>
                  <ArrowRight size={14} />
                </p>
              </button>

              <button
                className={styles.metric}
                onClick={() => go('/admin/bookings')}
              >
                <div className={styles.metricTop}>
                  <span>PAYMENTS</span>
                  <div>
                    <CreditCard size={17} />
                  </div>
                </div>

                <strong>{paidCount}</strong>

                <p>
                  <span>{paidRate}% paid</span>
                  <ArrowRight size={14} />
                </p>
              </button>

              <button
                className={`${styles.metric} ${styles.metricDark}`}
                onClick={() => go('/admin/rides')}
              >
                <div className={styles.metricTop}>
                  <span>COMPLETED</span>
                  <div>
                    <CheckCircle2 size={17} />
                  </div>
                </div>

                <strong>{completedCount}</strong>

                <p>
                  <span>{completedRate}% completion</span>
                  <ArrowRight size={14} />
                </p>
              </button>
            </div>
          </section>

          <section className={styles.insightLayer}>
            <div className={styles.layerCaption}>
              <span>02</span>
              <strong>NETWORK INTELLIGENCE</strong>
              <i />
              <small>LIVE OPERATIONAL VIEW</small>
            </div>

            <div className={styles.insightGrid}>
              <button
                className={`${styles.insightCard} ${styles.chartCard}`}
                onClick={() => go('/admin/rides')}
              >
                <div className={styles.insightHeader}>
                  <div>
                    <span className={styles.eyebrow}>NETWORK PULSE</span>
                    <h2>Ride activity</h2>
                  </div>

                  <span className={styles.liveTag}>
                    <i />
                    LIVE VIEW
                  </span>
                </div>

                <div className={styles.mapStage}>
                  <div className={styles.mapGrid} />

                  <svg
                    className={styles.mapRoutes}
                    viewBox="0 0 900 360"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M55 292 C140 250 145 174 235 202 S345 276 421 210 S510 85 595 119 S718 225 845 92"
                    />

                    <path
                      d="M105 70 C188 116 225 120 300 83 S428 53 487 126 S615 246 705 255 S790 240 860 280"
                    />

                    <path
                      d="M180 325 C245 274 283 241 335 180 S430 103 490 158 S570 310 665 289 S755 190 825 165"
                    />

                    <path
                      className={styles.routeAccent}
                      d="M92 274 C170 246 190 183 268 192 S366 246 432 207 S522 112 596 130 S703 206 814 105"
                    />
                  </svg>

                  <div className={`${styles.mapNode} ${styles.nodeOne}`}>
                    <span />
                    <b>01</b>
                  </div>

                  <div className={`${styles.mapNode} ${styles.nodeTwo}`}>
                    <span />
                    <b>02</b>
                  </div>

                  <div className={`${styles.mapNode} ${styles.nodeThree}`}>
                    <span />
                    <b>03</b>
                  </div>

                  <div className={`${styles.mapNode} ${styles.nodeFour}`}>
                    <span />
                    <b>04</b>
                  </div>

                  <div className={styles.mapVehicle}>
                    <Car size={13} />
                  </div>

                  <div className={styles.mapLegend}>
                    <span>
                      <i className={styles.legendBlue} />
                      Active route
                    </span>
                    <span>
                      <i className={styles.legendGreen} />
                      Pickup
                    </span>
                    <span>
                      <i className={styles.legendAmber} />
                      Destination
                    </span>
                  </div>

                  <div className={styles.mapBadge}>
                    <span>NETWORK</span>
                    <strong>UK OPERATIONS</strong>
                  </div>
                </div>

                <div className={styles.mapFooter}>
                  <div>
                    <strong>{totalCount}</strong>
                    <span>total rides</span>
                  </div>

                  <div>
                    <strong>{pendingCount}</strong>
                    <span>pending</span>
                  </div>

                  <div>
                    <strong>{completedCount}</strong>
                    <span>completed</span>
                  </div>

                  <span className={styles.mapOpen}>
                    Open ride control
                    <ChevronRight size={15} />
                  </span>
                </div>
              </button>

              <button
                className={`${styles.insightCard} ${styles.progressCard}`}
                onClick={() => go('/admin/bookings')}
              >
                <div className={styles.insightHeader}>
                  <div>
                    <span className={styles.eyebrow}>BOOKING HEALTH</span>
                    <h2>Journey progress</h2>
                  </div>

                  <Gauge size={18} />
                </div>

                <div className={styles.progressLayout}>
                  <div
                    className={styles.progressRing}
                    style={{
                      background: `conic-gradient(#6076f4 ${completedRate * 3.6}deg, #e9edf4 0deg)`,
                    }}
                  >
                    <div>
                      <strong>{completedRate}%</strong>
                      <span>complete</span>
                    </div>
                  </div>

                  <div className={styles.progressData}>
                    <div>
                      <span><i className={styles.blue} />Paid</span>
                      <strong>{paidCount}</strong>
                    </div>

                    <div>
                      <span><i className={styles.amber} />Pending</span>
                      <strong>{pendingCount}</strong>
                    </div>

                    <div>
                      <span><i className={styles.green} />Completed</span>
                      <strong>{completedCount}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.insightFooter}>
                  <span>Open booking control</span>
                  <ChevronRight size={16} />
                </div>
              </button>
            </div>
          </section>

          <section className={styles.operationLayer}>
            <div className={styles.layerCaption}>
              <span>03</span>
              <strong>OPERATIONS</strong>
              <i />
              <small>CONTROL MODULES</small>
            </div>

            <div className={styles.operationGrid}>
              <button
                className={`${styles.operationCard} ${styles.driverCard}`}
                onClick={() => go('/admin/drivers')}
              >
                <div className={styles.operationIcon}>
                  <Users size={20} />
                </div>

                <div className={styles.operationText}>
                  <span>FLEET CONTROL</span>
                  <h3>Driver availability</h3>
                  <p>Monitor the active driver network.</p>
                </div>

                <div className={styles.operationValue}>
                  <strong>—</strong>
                  <small>available</small>
                </div>

                <ArrowUpRight className={styles.operationArrow} size={17} />
              </button>

              <button
                className={`${styles.operationCard} ${styles.supportCard}`}
                onClick={() => go('/admin/notifications')}
              >
                <div className={styles.operationIcon}>
                  <Activity size={20} />
                </div>

                <div className={styles.operationText}>
                  <span>SERVICE DESK</span>
                  <h3>Complaints & support</h3>
                  <p>Customer issues and operational alerts.</p>
                </div>

                <div className={styles.operationValue}>
                  <strong>—</strong>
                  <small>open</small>
                </div>

                <ArrowUpRight className={styles.operationArrow} size={17} />
              </button>

              <button
                className={`${styles.operationCard} ${styles.paymentCard}`}
                onClick={() => go('/admin/driver-payments')}
              >
                <div className={styles.operationIcon}>
                  <CreditCard size={20} />
                </div>

                <div className={styles.operationText}>
                  <span>FINANCE</span>
                  <h3>Driver payments</h3>
                  <p>Manage driver payment operations.</p>
                </div>

                <div className={styles.operationValue}>
                  <strong>→</strong>
                  <small>open</small>
                </div>

                <ArrowUpRight className={styles.operationArrow} size={17} />
              </button>
            </div>
          </section>

          <section className={styles.utilityLayer}>
            <button
              className={styles.utilityCard}
              onClick={() => go('/admin/availability')}
            >
              <span className={styles.utilityIcon}>
                <MapPin size={17} />
              </span>

              <div>
                <span>AVAILABILITY CONTROL</span>
                <strong>Vehicle availability centre</strong>
                <small>Manage blackout windows and operational availability</small>
              </div>

              <span className={styles.utilityAction}>
                Open <ArrowUpRight size={13} />
              </span>
            </button>

            <button
              className={styles.utilityCard}
              onClick={() => go('/admin/audit-log')}
            >
              <span className={styles.utilityIcon}>
                <Activity size={17} />
              </span>

              <div>
                <span>SECURITY & HISTORY</span>
                <strong>Administrative activity</strong>
                <small>Review actions and system history</small>
              </div>

              <span className={styles.utilityAction}>
                Open <ArrowUpRight size={13} />
              </span>
            </button>
          </section>
        </main>
      )}
    </div>
  );
}
