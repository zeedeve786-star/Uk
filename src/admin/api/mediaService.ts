import { adminApi } from './adminHttpClient';
import type { MediaAssetRow, MediaType } from '../models';

export const mediaApi = {
  list: () => adminApi.get<MediaAssetRow[]>('/admin/media'),
  create: (data: { url: string; altText?: string; mediaType: MediaType }) =>
    adminApi.post<MediaAssetRow>('/admin/media', data),
  remove: (id: string) => adminApi.delete<{ deleted: true }>(`/admin/media/${id}`),
};