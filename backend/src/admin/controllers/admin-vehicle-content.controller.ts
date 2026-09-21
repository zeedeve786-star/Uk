import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { VehicleContentService } from '../../content/vehicle-content.service';
import { CreateVehicleContentDto } from '../../content/dto/create-vehicle-content.dto';
import { UpdateVehicleContentDto } from '../../content/dto/update-vehicle-content.dto';

@Controller('admin/content/vehicles')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_CONTENT)
export class AdminVehicleContentController {
  constructor(
    private readonly service: VehicleContentService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateVehicleContentDto, @CurrentAdmin() actor: AdminRequestUser) {
    const entry = await this.service.create(dto);
    await this.auditService.record(actor.id, 'CREATE_VEHICLE_CONTENT', 'VehicleContent', entry.id, {
      vehicleCategory: entry.vehicleCategory,
    });
    return entry;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleContentDto, @CurrentAdmin() actor: AdminRequestUser) {
    const entry = await this.service.update(id, dto);
    await this.auditService.record(actor.id, 'UPDATE_VEHICLE_CONTENT', 'VehicleContent', entry.id);
    return entry;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentAdmin() actor: AdminRequestUser) {
    await this.service.delete(id);
    await this.auditService.record(actor.id, 'DELETE_VEHICLE_CONTENT', 'VehicleContent', id);
    return { deleted: true };
  }
}