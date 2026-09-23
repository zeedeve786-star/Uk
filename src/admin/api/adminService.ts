import { adminApi } from './adminHttpClient';
import type { AdminUserRow, AdminBookingRow, AdminDiscountRow, AdminAuditLogRow, FareConfig, AdminPermission, AdminRole, ApiIntegrationRow, ApiStatus } from '../models';

export const usersApi = {
  list: () => adminApi.get<AdminUserRow[]>('/admin/users'),
  create: (data: { email: string; password: string; role: AdminRole; isMasterAdmin?: boolean; adminPermissions?: AdminPermission[] }) =>
    adminApi.post<AdminUserRow>('/admin/users', data),
  updatePermissions: (id: string, data: { isMasterAdmin?: boolean; adminPermissions?: AdminPermission[] }) =>
    adminApi.patch<AdminUserRow>(`/admin/users/${id}/permissions`, data),
  remove: (id: string) =>
    adminApi.delete<{ deleted: true }>(`/admin/users/${id}`),
};

export const bookingsApi = {
  list: () => adminApi.get<AdminBookingRow[]>('/admin/bookings'),
  getOne: (reference: string) => adminApi.get<AdminBookingRow>(`/admin/bookings/${reference}`),
  updateStatus: (reference: string, bookingStatus: AdminBookingRow['bookingStatus']) =>
    adminApi.patch<AdminBookingRow>(`/admin/bookings/${reference}/status`, { bookingStatus }),
};

export const discountsApi = {
  list: () => adminApi.get<AdminDiscountRow[]>('/admin/discounts'),
  create: (data: Partial<AdminDiscountRow>) => adminApi.post<AdminDiscountRow>('/admin/discounts', data),
  update: (id: string, data: Partial<AdminDiscountRow>) => adminApi.patch<AdminDiscountRow>(`/admin/discounts/${id}`, data),
};

export const fareConfigApi = {
  get: () => adminApi.get<FareConfig>('/admin/fare/config'),
  update: (data: Partial<FareConfig>) =>
    adminApi.patch<FareConfig>('/admin/fare/config', data),
};

export const auditLogApi = {
  list: () => adminApi.get<AdminAuditLogRow[]>('/admin/audit-log'),
};
export const apiManagementApi = {
  list: () => adminApi.get<ApiIntegrationRow[]>('/admin/api-management'),
  create: (data: {
    name: string;
    provider: string;
    baseUrl: string;
    apiKey?: string;
    description?: string;
    status?: ApiStatus;
  }) => adminApi.post<ApiIntegrationRow>('/admin/api-management', data),
  update: (
    id: string,
    data: {
      name?: string;
      provider?: string;
      baseUrl?: string;
      apiKey?: string;
      description?: string;
      status?: ApiStatus;
    },
  ) => adminApi.patch<ApiIntegrationRow>(`/admin/api-management/${id}`, data),
  remove: (id: string) =>
    adminApi.delete<ApiIntegrationRow>(`/admin/api-management/${id}`),
};
