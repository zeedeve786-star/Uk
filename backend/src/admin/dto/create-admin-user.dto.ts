import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { AdminPermission, Role } from '@prisma/client';

export class CreateAdminUserDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  // ADMIN or DRIVER only — CUSTOMER accounts come from /auth/register.
  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsBoolean()
  isMasterAdmin?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  adminPermissions?: AdminPermission[];
}
