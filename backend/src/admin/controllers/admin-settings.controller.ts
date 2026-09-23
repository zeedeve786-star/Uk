import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { SettingsService } from '../../settings/settings.service';
import { UpdateSettingsDto } from '../../settings/dto/update-settings.dto';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_SETTINGS)
export class AdminSettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  get() {
    return this.settingsService.getSettings();
  }

  @Patch()
  async update(@Body() dto: UpdateSettingsDto, @CurrentAdmin() actor: AdminRequestUser) {
    const settings = await this.settingsService.updateSettings(dto);
    await this.auditService.record(actor.id, 'UPDATE_SETTINGS', 'PlatformSettings', settings.id, dto as Record<string, unknown>);
    return settings;
  }
}