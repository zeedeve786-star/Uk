import { adminApi } from './adminHttpClient';
import type { NotificationRow } from '../models';

export const notificationsApi = {
  list: (onlyUnread = false) => adminApi.get<NotificationRow[]>(`/admin/notifications${onlyUnread ? '?unread=true' : ''}`),
  markRead: (id: string) => adminApi.patch<NotificationRow>(`/admin/notifications/${id}/read`, {}),
};
