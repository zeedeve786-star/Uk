import { adminApi } from './adminHttpClient';
import type { RideRow, RideStatus } from '../models';

export const ridesApi = {
  list: () => adminApi.get<RideRow[]>('/admin/rides'),
  getOne: (reference: string) =>
    adminApi.get<RideRow>(`/admin/rides/${reference}`),

  updateStatus: (reference: string, status: RideStatus) =>
    adminApi.patch<RideRow>(`/admin/rides/${reference}/status`, { status }),

  assignDriver: (reference: string, driverId: string | null) =>
    adminApi.patch<RideRow>(`/admin/rides/${reference}/driver`, {
      driverId,
    }),
};
