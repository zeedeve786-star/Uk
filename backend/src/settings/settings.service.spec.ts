import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let prisma: { platformSettings: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } };
  let service: SettingsService;

  beforeEach(() => {
    prisma = { platformSettings: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() } };
    service = new SettingsService(prisma as any);
  });

  it('creates the singleton row with a fixed id when none exists', async () => {
    prisma.platformSettings.findUnique.mockResolvedValue(null);
    prisma.platformSettings.create.mockResolvedValue({ id: 'singleton' });

    const result = await service.getSettings();

    expect(prisma.platformSettings.create).toHaveBeenCalledWith({ data: { id: 'singleton' } });
    expect(result.id).toBe('singleton');
  });

  it('returns the existing row without creating a duplicate', async () => {
    prisma.platformSettings.findUnique.mockResolvedValue({ id: 'singleton', companyName: 'Existing Co' });

    const result = await service.getSettings();

    expect(prisma.platformSettings.create).not.toHaveBeenCalled();
    expect(result.companyName).toBe('Existing Co');
  });

  it('updates only the provided fields', async () => {
    prisma.platformSettings.findUnique.mockResolvedValue({ id: 'singleton' });
    prisma.platformSettings.update.mockResolvedValue({ id: 'singleton', companyName: 'New Co' });

    await service.updateSettings({ companyName: 'New Co' });

    expect(prisma.platformSettings.update).toHaveBeenCalledWith({
      where: { id: 'singleton' },
      data: { companyName: 'New Co' },
    });
  });

  it('ensures the row exists before an update on a fresh database', async () => {
    prisma.platformSettings.findUnique.mockResolvedValue(null);
    prisma.platformSettings.create.mockResolvedValue({ id: 'singleton' });
    prisma.platformSettings.update.mockResolvedValue({ id: 'singleton', tickerMessage: 'Welcome' });

    await service.updateSettings({ tickerMessage: 'Welcome' });

    expect(prisma.platformSettings.create).toHaveBeenCalled();
    expect(prisma.platformSettings.update).toHaveBeenCalled();
  });
});