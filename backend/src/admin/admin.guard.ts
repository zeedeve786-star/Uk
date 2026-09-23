import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminPermission, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSION_KEY } from './decorators/require-permission.decorator';
import { MASTER_ADMIN_KEY } from './decorators/require-master-admin.decorator';
import { AdminRequestUser } from './models/admin-request-user';

/**
 * Runs after JwtAuthGuard. Re-reads the user's admin status/permissions
 * fresh from the database on every request rather than trusting the JWT
 * payload, so a permission revocation takes effect immediately without
 * waiting for token expiry. Enforces role === ADMIN itself, so it does not
 * need to be combined with RolesGuard.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user as { id: string } | undefined;
    if (!jwtUser?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: jwtUser.id } });
    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    const requireMasterAdmin = this.reflector.getAllAndOverride<boolean>(MASTER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requireMasterAdmin && !user.isMasterAdmin) {
      throw new ForbiddenException('Master Admin access required');
    }

    const requiredPermission = this.reflector.getAllAndOverride<AdminPermission>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (
      requiredPermission &&
      !user.isMasterAdmin &&
      !user.adminPermissions.includes(requiredPermission)
    ) {
      throw new ForbiddenException('Insufficient admin permissions');
    }

    const adminUser: AdminRequestUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      isMasterAdmin: user.isMasterAdmin,
      adminPermissions: user.adminPermissions,
    };

    request.adminUser = adminUser;
    return true;
  }
}
