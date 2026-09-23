import { adminApi } from './adminHttpClient';
import type { AvailabilityBlockRow, AvailabilityCheckResult, VehicleCategoryId } from '../models';

export const availabilityApi = {
  listBlocks: () => adminApi.get<AvailabilityBlockRow[]>('/admin/availability/blocks'),
  createBlock: (data: { vehicleCategory: VehicleCategoryId; startsAt: string; endsAt: string; reason?: string }) =>
    adminApi.post<AvailabilityBlockRow>('/admin/availability/blocks', data),
  deleteBlock: (id: string) => adminApi.delete<{ deleted: true }>(`/admin/availability/blocks/${id}`),
  check: (data: { vehicleCategory: VehicleCategoryId; date: string; time: string }) =>
    adminApi.post<AvailabilityCheckResult>('/admin/availability/check', data),
};