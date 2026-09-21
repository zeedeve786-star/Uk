import { adminApi } from './adminHttpClient';
import type {
  BlogRow,
  ServiceContentRow,
  ContentStatus,
  VehicleContentRow,
} from '../models';

export const blogsApi = {
  list: () => adminApi.get<BlogRow[]>('/admin/content/blogs'),
  getOne: (id: string) => adminApi.get<BlogRow>(`/admin/content/blogs/${id}`),
  create: (data: Partial<BlogRow>) =>
    adminApi.post<BlogRow>('/admin/content/blogs', data),
  update: (id: string, data: Partial<BlogRow>) =>
    adminApi.patch<BlogRow>(`/admin/content/blogs/${id}`, data),
  updateStatus: (id: string, status: ContentStatus) =>
    adminApi.patch<BlogRow>(`/admin/content/blogs/${id}/status`, { status }),
  remove: (id: string) =>
    adminApi.delete<{ deleted: true }>(`/admin/content/blogs/${id}`),
};

export const serviceContentApi = {
  list: () =>
    adminApi.get<ServiceContentRow[]>('/admin/content/service-content'),
  getOne: (id: string) =>
    adminApi.get<ServiceContentRow>(`/admin/content/service-content/${id}`),
  create: (data: Partial<ServiceContentRow>) =>
    adminApi.post<ServiceContentRow>('/admin/content/service-content', data),
  update: (id: string, data: Partial<ServiceContentRow>) =>
    adminApi.patch<ServiceContentRow>(
      `/admin/content/service-content/${id}`,
      data,
    ),
  updateStatus: (id: string, status: ContentStatus) =>
    adminApi.patch<ServiceContentRow>(
      `/admin/content/service-content/${id}/status`,
      { status },
    ),
  remove: (id: string) =>
    adminApi.delete<{ deleted: true }>(
      `/admin/content/service-content/${id}`,
    ),
};

export const vehicleContentApi = {
  list: () =>
    adminApi.get<VehicleContentRow[]>('/admin/content/vehicles'),
  create: (data: Partial<VehicleContentRow>) =>
    adminApi.post<VehicleContentRow>('/admin/content/vehicles', data),
  update: (id: string, data: Partial<VehicleContentRow>) =>
    adminApi.patch<VehicleContentRow>(
      `/admin/content/vehicles/${id}`,
      data,
    ),
  remove: (id: string) =>
    adminApi.delete<{ deleted: true }>(
      `/admin/content/vehicles/${id}`,
    ),
};