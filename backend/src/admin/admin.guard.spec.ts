import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminPermission, Role } from '@prisma/client';
import { AdminGuard } from './admin.guard';

function makeContext(requestUser: any) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user: requestUser }) }),
  } as any;
}

describe('AdminGuard', () => {
  let prisma: { user: { findUnique: jest.Mock } };

  function makeGuard(metadataMap: Record<string, any>) {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => metadataMap[key]),
    } as unknown as Reflector;

    return new AdminGuard(reflector, prisma as any);
  }

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn() } };
  });

  it('rejects when no authenticated user is present', async () => {
    const guard = makeGuard({});
    await expect(guard.canActivate(makeContext(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a non-ADMIN role', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      role: Role.CUSTOMER,
      isMasterAdmin: false,
      adminPermissions: [],
    });

    const guard = makeGuard({});
    await expect(guard.canActivate(makeContext({ id: '1' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects a subordinate admin missing the required permission', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: false,
      adminPermissions: [AdminPermission.MANAGE_BOOKINGS],
    });

    const guard = makeGuard({
      adminPermission: AdminPermission.MANAGE_DISCOUNTS,
    });

    await expect(guard.canActivate(makeContext({ id: '1' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows a subordinate admin who holds the required permission', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: false,
      adminPermissions: [AdminPermission.MANAGE_DISCOUNTS],
    });

    const guard = makeGuard({
      adminPermission: AdminPermission.MANAGE_DISCOUNTS,
    });

    await expect(guard.canActivate(makeContext({ id: '1' }))).resolves.toBe(true);
  });

  it('allows a Master Admin regardless of the specific permission required', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: true,
      adminPermissions: [],
    });

    const guard = makeGuard({
      adminPermission: AdminPermission.MANAGE_ADMINS,
    });

    await expect(guard.canActivate(makeContext({ id: '1' }))).resolves.toBe(true);
  });

  it('rejects a non-master admin from a Master-Admin-only route', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: false,
      adminPermissions: [AdminPermission.MANAGE_ADMINS],
    });

    const guard = makeGuard({ requireMasterAdmin: true });

    await expect(guard.canActivate(makeContext({ id: '1' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows a Master Admin on a Master-Admin-only route', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: true,
      adminPermissions: [],
    });

    const guard = makeGuard({ requireMasterAdmin: true });

    await expect(guard.canActivate(makeContext({ id: '1' }))).resolves.toBe(true);
  });
});
