import { adminApi } from './adminHttpClient';
import type { PlatformSettingsRow } from '../models';

export const settingsApi = {
  get: () => adminApi.get<PlatformSettingsRow>('/admin/settings'),
  update: (data: {
    companyName?: string;
    phoneDisplay?: string;
    phoneTel?: string;
    whatsappNumber?: string;
    contactEmail?: string;
    logoUrl?: string;
    tickerMessage?: string;
  }) => adminApi.patch<PlatformSettingsRow>('/admin/settings', data),
};
