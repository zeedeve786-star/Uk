import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { AdminAuditService } from '../admin-audit.service';

@Controller('admin/audit-log')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAuditController {
  constructor(private readonly auditService: AdminAuditService) {}

  @Get()
  @RequirePermission(AdminPermission.VIEW_AUDIT_LOG)
  list() {
    return this.auditService.list();
  }
}
