import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminPermission, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequireMasterAdmin } from '../decorators/require-master-admin.decorator';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { UpdateAdminPermissionsDto } from '../dto/update-admin-permissions.dto';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';

const SALT_ROUNDS = 10;

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  @RequirePermission(AdminPermission.MANAGE_ADMINS)
  list() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isMasterAdmin: true,
        adminPermissions: true,
        createdAt: true,
      },
    });
  }

  // Restricted to Master Admin only — creating ADMIN/DRIVER accounts is
  // privileged and a subordinate admin (even with MANAGE_ADMINS) must not be
  // able to perform it, to prevent privilege self-escalation.
  @Post()
  @RequireMasterAdmin()
  async create(
    @Body() dto: CreateAdminUserDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    if (dto.role === Role.CUSTOMER) {
      throw new BadRequestException(
        'Customer accounts must be created through /auth/register',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        isMasterAdmin: dto.isMasterAdmin ?? false,
        adminPermissions: dto.adminPermissions ?? [],
      },
      select: {
        id: true,
        email: true,
        role: true,
        isMasterAdmin: true,
        adminPermissions: true,
        createdAt: true,
      },
    });

    await this.auditService.record(
      actor.id,
      'CREATE_ADMIN_USER',
      'User',
      user.id,
      { role: user.role },
    );

    return user;
  }

  @Patch(':id/permissions')
  @RequireMasterAdmin()
  async updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateAdminPermissionsDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.isMasterAdmin !== undefined
          ? { isMasterAdmin: dto.isMasterAdmin }
          : {}),
        ...(dto.adminPermissions !== undefined
          ? { adminPermissions: dto.adminPermissions }
          : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
        isMasterAdmin: true,
        adminPermissions: true,
      },
    });

    await this.auditService.record(
      actor.id,
      'UPDATE_ADMIN_PERMISSIONS',
      'User',
      user.id,
      {
        isMasterAdmin: user.isMasterAdmin,
        adminPermissions: user.adminPermissions,
      },
    );

    return user;
  }

  @Delete(':id')
  @RequireMasterAdmin()
  async remove(
    @Param('id') id: string,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    if (id === actor.id) {
      throw new BadRequestException('You cannot remove your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isMasterAdmin: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === Role.CUSTOMER) {
      throw new BadRequestException(
        'Customer accounts cannot be removed through admin user management',
      );
    }

    if (user.isMasterAdmin) {
      const masterCount = await this.prisma.user.count({
        where: {
          isMasterAdmin: true,
          role: Role.ADMIN,
        },
      });

      if (masterCount <= 1) {
        throw new BadRequestException(
          'The last Master Admin cannot be removed',
        );
      }
    }

    await this.prisma.user.delete({
      where: { id },
    });

    await this.auditService.record(
      actor.id,
      'DELETE_ADMIN_USER',
      'User',
      user.id,
      {
        email: user.email,
        role: user.role,
      },
    );

    return { deleted: true };
  }


}
