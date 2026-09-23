import { SetMetadata } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';

export const PERMISSION_KEY = 'adminPermission';
export const RequirePermission = (permission: AdminPermission) => SetMetadata(PERMISSION_KEY, permission);
