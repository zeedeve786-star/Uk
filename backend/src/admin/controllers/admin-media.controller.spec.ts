import { MediaType, Role } from '@prisma/client';
import { AdminMediaController } from './admin-media.controller';

describe('AdminMediaController', () => {
  it('creates a media asset and records an audit entry', async () => {
    const mediaService = { create: jest.fn().mockResolvedValue({ id: 'm1', mediaType: MediaType.IMAGE }) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminMediaController(mediaService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    const result = await controller.create({ url: 'https://example.com/x.jpg', mediaType: MediaType.IMAGE } as any, actor);

    expect(mediaService.create).toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'CREATE_MEDIA_ASSET', 'MediaAsset', 'm1', expect.any(Object));
    expect(result.id).toBe('m1');
  });

  it('records an audit entry on delete', async () => {
    const mediaService = { delete: jest.fn().mockResolvedValue(undefined) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminMediaController(mediaService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    await controller.delete('m1', actor);

    expect(mediaService.delete).toHaveBeenCalledWith('m1');
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'DELETE_MEDIA_ASSET', 'MediaAsset', 'm1');
  });
});