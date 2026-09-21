import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { AvailabilityService } from '../../availability/availability.service';
import { CreateAvailabilityBlockDto } from '../../availability/dto/create-availability-block.dto';
import { CheckAvailabilityDto } from '../../availability/dto/check-availability.dto';

@Controller('admin/availability')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_AVAILABILITY)
export class AdminAvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get('blocks')
  listBlocks() {
    return this.availabilityService.listBlocks();
  }

  @Post('blocks')
  async createBlock(
    @Body() dto: CreateAvailabilityBlockDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const block = await this.availabilityService.createBlock(dto);

    await this.auditService.record(
      actor.id,
      'CREATE_AVAILABILITY_BLOCK',
      'AvailabilityBlock',
      block.id,
      {
        vehicleCategory: block.vehicleCategory,
      },
    );

    return block;
  }

  @Delete('blocks/:id')
  async deleteBlock(
    @Param('id') id: string,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    await this.availabilityService.deleteBlock(id);

    await this.auditService.record(
      actor.id,
      'DELETE_AVAILABILITY_BLOCK',
      'AvailabilityBlock',
      id,
    );

    return { deleted: true };
  }

  @Post('check')
  check(@Body() dto: CheckAvailabilityDto) {
    return this.availabilityService.checkAvailability(dto);
  }
}
