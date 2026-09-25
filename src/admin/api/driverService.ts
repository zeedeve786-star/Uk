import { adminApi } from './adminHttpClient';
import type { DriverProfileRow, DriverStatus, VehicleCategoryId } from '../models';

export const driversApi = {
  list: () => adminApi.get<DriverProfileRow[]>('/admin/drivers'),
  listAssignable: (vehicleCategory?: VehicleCategoryId) =>
    adminApi.get<DriverProfileRow[]>(`/admin/drivers/assignable${vehicleCategory ? `?vehicleCategory=${vehicleCategory}` : ''}`),
  getOne: (id: string) => adminApi.get<DriverProfileRow>(`/admin/drivers/${id}`),
  create: (data: { userId: string; name?: string; vehicleCategory?: VehicleCategoryId; phone?: string }) =>
    adminApi.post<DriverProfileRow>('/admin/drivers', data),
  updateStatus: (id: string, status: DriverStatus) => adminApi.patch<DriverProfileRow>(`/admin/drivers/${id}/status`, { status }),
  update: (id: string, data: { name?: string; vehicleCategory?: VehicleCategoryId; phone?: string }) =>
    adminApi.patch<DriverProfileRow>(`/admin/drivers/${id}`, data),
};
