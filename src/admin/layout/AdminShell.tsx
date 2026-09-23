import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  Bell,
  BookOpen,
  Car,
  CircleDollarSign,
  ClipboardList,
  Database,
  FileClock,
  Gauge,
  LayoutDashboard,
  Library,
  Menu,
  Percent,
  Plane,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminPermissions } from '../hooks/useAdminPermissions';
import type { AdminPermission } from '../models';
import styles from './AdminShell.module.css';
import { Button } from '../ui/Button';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', end: true, permission: null, icon: LayoutDashboard },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/bookings', label: 'Bookings', permission: 'MANAGE_BOOKINGS' as const, icon: ClipboardList },
      { to: '/admin/availability', label: 'Availability', permission: 'MANAGE_AVAILABILITY' as const, icon: Activity },
      { to: '/admin/drivers', label: 'Drivers', permission: 'MANAGE_DRIVERS' as const, icon: Users },
      { to: '/admin/rides', label: 'Rides', permission: 'MANAGE_RIDES' as const, icon: Car },
      { to: '/admin/notifications', label: 'Notifications', permission: 'VIEW_NOTIFICATIONS' as const, icon: Bell },
      { to: '/admin/driver-payments', label: 'Driver Payments', permission: 'MANAGE_DRIVER_PAYMENTS' as const, icon: WalletCards },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/discounts', label: 'Discounts', permission: 'MANAGE_DISCOUNTS' as const, icon: Percent },
      { to: '/admin/users', label: 'Users & Admins', permission: 'MANAGE_ADMINS' as const, icon: Users },
      { to: '/admin/fare-config', label: 'Fare Configuration', permission: 'VIEW_FARE_CONFIG' as const, icon: CircleDollarSign },
      { to: '/admin/audit-log', label: 'Audit Log', permission: 'VIEW_AUDIT_LOG' as const, icon: FileClock },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/content/blogs', label: 'Blogs', permission: 'MANAGE_CONTENT' as const, icon: BookOpen },
      { to: '/admin/content/service-content', label: 'Service Content', permission: 'MANAGE_CONTENT' as const, icon: Plane },
      { to: '/admin/content/vehicles', label: 'Vehicle Content', permission: 'MANAGE_CONTENT' as const, icon: Car },
      { to: '/admin/media', label: 'Media Library', permission: 'MANAGE_CONTENT' as const, icon: Library },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', permission: 'MANAGE_SETTINGS' as const, icon: Settings },
      { to: '/admin/api-management', label: 'API Management', permission: null, masterOnly: true, icon: Database },
    ],
  },
];

export function AdminShell() {
  const { admin, logout } = useAdminAuth();
  const { isMasterAdmin, permissions, loaded } = useAdminPermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const canSee = (item: {
    permission?: AdminPermission | null;
    masterOnly?: boolean;
  }) =>
    (!item.permission && !item.masterOnly) ||
    (item.masterOnly && isMasterAdmin) ||
    isMasterAdmin ||
    permissions.includes(item.permission!) ||
    !loaded;

  return (
    <div className={styles.shell}>
      <div
        className={`${styles.mobileBackdrop} ${sidebarOpen ? styles.mobileBackdropVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
        aria-label="Admin navigation"
      >
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Gauge size={19} strokeWidth={2.1} />
          </div>
          <div className={styles.brandName}>
            <strong>UKT</strong>
            <span>ADMIN</span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.railStatus}>
          <span />
          <b>LIVE</b>
        </div>

        <div className={styles.navigation}>
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(canSee);

            if (!visibleItems.length) return null;

            return (
              <section key={group.label} className={styles.navGroup}>
                <div className={styles.groupLabel}>{group.label}</div>

                {visibleItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={'end' in item ? item.end : undefined}
                      title={item.label}
                      className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className={styles.iconBox}>
                        <Icon size={17} strokeWidth={1.9} />
                      </span>

                      <span className={styles.itemText}>{item.label}</span>
                    </NavLink>
                  );
                })}
              </section>
            );
          })}
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.security}>
            <ShieldCheck size={14} />
            <span>Secure</span>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.mobileToggle}
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            <div className={styles.heading}>
              <span>TRANSPORT CONTROL</span>
              <strong>Operations</strong>
            </div>
          </div>

          <div className={styles.account}>
            <div className={styles.avatar}>
              {(admin?.email?.[0] || 'A').toUpperCase()}
            </div>

            <div className={styles.accountText}>
              <strong>{admin?.email || 'Administrator'}</strong>
              <span>{isMasterAdmin ? 'Master Admin' : 'Administrator'}</span>
            </div>

            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
