import { IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { AdminPermission } from '@prisma/client';

export class UpdateAdminPermissionsDto {
  @IsOptional()
  @IsBoolean()
  isMasterAdmin?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  adminPermissions?: AdminPermission[];
}
