import { SetMetadata } from '@nestjs/common';

export const MASTER_ADMIN_KEY = 'requireMasterAdmin';
export const RequireMasterAdmin = () => SetMetadata(MASTER_ADMIN_KEY, true);
