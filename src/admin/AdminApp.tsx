import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { RequireAdminAuth } from './layout/RequireAdminAuth';
import { AdminShell } from './layout/AdminShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingsPage } from './pages/BookingsPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { DiscountsPage } from './pages/DiscountsPage';
import { UsersPage } from './pages/UsersPage';
import { FareConfigPage } from './pages/FareConfigPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { BlogsPage } from './pages/BlogsPage';
import { ServiceContentPage } from './pages/ServiceContentPage';
import { VehicleContentPage } from './pages/VehicleContentPage';
import { SettingsPage } from './pages/SettingsPage';
import { MediaLibraryPage } from './pages/MediaLibraryPage';
import { ApiManagementPage } from './pages/ApiManagementPage';
import { DriversPage } from './pages/DriversPage';
import { RidesPage } from './pages/RidesPage';
import { RideDetailPage } from './pages/RideDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { DriverPaymentsPage } from './pages/DriverPaymentsPage';

export function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/:reference" element={<BookingDetailPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="rides" element={<RidesPage />} />
            <Route path="rides/:reference" element={<RideDetailPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="driver-payments" element={<DriverPaymentsPage />} />
            <Route path="discounts" element={<DiscountsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="fare-config" element={<FareConfigPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="content/blogs" element={<BlogsPage />} />
            <Route path="content/service-content" element={<ServiceContentPage />} />
            <Route path="content/vehicles" element={<VehicleContentPage />} />
            <Route path="media" element={<MediaLibraryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="api-management" element={<ApiManagementPage />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
