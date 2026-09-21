import { AdminPermission, Role } from '@prisma/client';
import { AdminUsersController } from './admin-users.controller';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let prisma: any;
  let audit: { record: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    audit = { record: jest.fn() };
    controller = new AdminUsersController(prisma, audit as any);
  });

  it('creates a subordinate admin with only the explicitly granted permissions', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user-2',
      email: 'sub@example.com',
      role: Role.ADMIN,
      isMasterAdmin: false,
      adminPermissions: [AdminPermission.MANAGE_BOOKINGS],
      createdAt: new Date(),
    });

    const actor = {
      id: 'master-1',
      email: 'm@a.com',
      role: Role.ADMIN,
      isMasterAdmin: true,
      adminPermissions: [],
    };

    const result = await controller.create(
      {
        email: 'sub@example.com',
        password: 'password123',
        role: Role.ADMIN,
        adminPermissions: [AdminPermission.MANAGE_BOOKINGS],
      } as any,
      actor,
    );

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isMasterAdmin: false,
          adminPermissions: [AdminPermission.MANAGE_BOOKINGS],
        }),
      }),
    );
    expect(result.isMasterAdmin).toBe(false);
    expect(audit.record).toHaveBeenCalled();
  });

  it('records an audit entry when updating admin permissions', async () => {
    prisma.user.update.mockResolvedValue({
      id: 'user-2',
      email: 'sub@example.com',
      role: Role.ADMIN,
      isMasterAdmin: false,
      adminPermissions: [AdminPermission.MANAGE_DISCOUNTS],
    });

    const actor = {
      id: 'master-1',
      email: 'm@a.com',
      role: Role.ADMIN,
      isMasterAdmin: true,
      adminPermissions: [],
    };

    await controller.updatePermissions(
      'user-2',
      { adminPermissions: [AdminPermission.MANAGE_DISCOUNTS] } as any,
      actor,
    );

    expect(audit.record).toHaveBeenCalledWith(
      'master-1',
      'UPDATE_ADMIN_PERMISSIONS',
      'User',
      'user-2',
      expect.any(Object),
    );
  });
});
