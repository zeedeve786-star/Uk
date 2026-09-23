import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export function RequireAdminAuth() {
  const { status, admin } = useAdminAuth();

  if (status === 'loading') return <p style={{ padding: 24 }}>Loading…</p>;
  if (status === 'unauthenticated') return <Navigate to="/admin/login" replace />;
  if (admin && admin.role !== 'ADMIN') return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}