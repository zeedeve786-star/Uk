import { Role } from '@prisma/client';
import { AdminSettingsController } from './admin-settings.controller';

describe('AdminSettingsController', () => {
  it('returns the current settings', async () => {
    const settingsService = { getSettings: jest.fn().mockResolvedValue({ id: 'singleton', companyName: 'Test Co' }) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminSettingsController(settingsService, audit as any);

    const result = await controller.get();
    expect(result.companyName).toBe('Test Co');
  });

  it('updates settings and records an audit entry', async () => {
    const settingsService = { updateSettings: jest.fn().mockResolvedValue({ id: 'singleton', companyName: 'Updated Co' }) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminSettingsController(settingsService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    const result = await controller.update({ companyName: 'Updated Co' } as any, actor);

    expect(settingsService.updateSettings).toHaveBeenCalledWith({ companyName: 'Updated Co' });
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'UPDATE_SETTINGS', 'PlatformSettings', 'singleton', expect.any(Object));
    expect(result.companyName).toBe('Updated Co');
  });
});