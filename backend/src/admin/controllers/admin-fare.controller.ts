import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { AdminAuditService } from '../admin-audit.service';
import { FareService } from '../../fare/fare.service';
import { UpdateFareConfigDto } from '../../fare/dto/update-fare-config.dto';

@Controller('admin/fare')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.VIEW_FARE_CONFIG)
export class AdminFareController {
  constructor(
    private readonly fareService: FareService,
    private readonly audit: AdminAuditService,
  ) {}

  @Get('config')
  async getConfig() {
    return this.fareService.getPricingConfig();
  }

  @Patch('config')
  async updateConfig(
    @Body() dto: UpdateFareConfigDto,
    @Req() req: any,
  ) {
    const result = await this.fareService.updateConfiguration(dto);

    await this.audit.record(
      req.adminUser.id,
      'FARE_CONFIGURATION_UPDATED',
      'FareConfiguration',
      result.id,
      { ...dto },
    );

    return this.fareService.getPricingConfig();
  }
}
