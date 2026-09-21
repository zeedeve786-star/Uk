import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { DriverService } from '../../driver/driver.service';
import { CreateDriverProfileDto } from '../../driver/dto/create-driver-profile.dto';
import { UpdateDriverStatusDto } from '../../driver/dto/update-driver-status.dto';
import { UpdateDriverProfileDto } from '../../driver/dto/update-driver-profile.dto';
import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';

@Controller('admin/drivers')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_DRIVERS)
export class AdminDriversController {
  constructor(
    private readonly driverService: DriverService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  list() {
    return this.driverService.list();
  }

  @Get('assignable')
  listAssignable(@Query('vehicleCategory') vehicleCategory?: VehicleCategoryId) {
    return this.driverService.listAssignable(vehicleCategory);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.driverService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateDriverProfileDto, @CurrentAdmin() actor: AdminRequestUser) {
    const profile = await this.driverService.createProfile(dto);
    await this.auditService.record(actor.id, 'CREATE_DRIVER_PROFILE', 'DriverProfile', profile.id, { userId: dto.userId });
    return profile;
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateDriverStatusDto, @CurrentAdmin() actor: AdminRequestUser) {
    const profile = await this.driverService.updateStatus(id, dto.status);
    await this.auditService.record(actor.id, 'UPDATE_DRIVER_STATUS', 'DriverProfile', id, { status: dto.status });
    return profile;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDriverProfileDto, @CurrentAdmin() actor: AdminRequestUser) {
    const profile = await this.driverService.updateProfile(id, dto);
    await this.auditService.record(actor.id, 'UPDATE_DRIVER_PROFILE', 'DriverProfile', id);
    return profile;
  }
}
