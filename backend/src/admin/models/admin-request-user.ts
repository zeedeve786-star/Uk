import { AdminPermission, Role } from '@prisma/client';

export interface AdminRequestUser {
  id: string;
  email: string;
  role: Role;
  isMasterAdmin: boolean;
  adminPermissions: AdminPermission[];
}
