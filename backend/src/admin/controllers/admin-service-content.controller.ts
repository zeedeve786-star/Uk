import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { ServiceContentService } from '../../content/service-content.service';
import { CreateServiceContentDto } from '../../content/dto/create-service-content.dto';
import { UpdateServiceContentDto } from '../../content/dto/update-service-content.dto';
import { UpdateContentStatusDto } from '../../content/dto/update-content-status.dto';

@Controller('admin/content/service-content')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_CONTENT)
export class AdminServiceContentController {
  constructor(
    private readonly service: ServiceContentService,
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
  async create(@Body() dto: CreateServiceContentDto, @CurrentAdmin() actor: AdminRequestUser) {
    const entry = await this.service.create(dto);
    await this.auditService.record(actor.id, 'CREATE_SERVICE_CONTENT', 'ServiceContent', entry.id, { type: entry.type });
    return entry;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceContentDto, @CurrentAdmin() actor: AdminRequestUser) {
    const entry = await this.service.update(id, dto);
    await this.auditService.record(actor.id, 'UPDATE_SERVICE_CONTENT', 'ServiceContent', entry.id);
    return entry;
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateContentStatusDto, @CurrentAdmin() actor: AdminRequestUser) {
    const entry = await this.service.updateStatus(id, dto.status);
    await this.auditService.record(actor.id, 'UPDATE_SERVICE_CONTENT_STATUS', 'ServiceContent', entry.id, { status: dto.status });
    return entry;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentAdmin() actor: AdminRequestUser) {
    await this.service.delete(id);
    await this.auditService.record(actor.id, 'DELETE_SERVICE_CONTENT', 'ServiceContent', id);
    return { deleted: true };
  }
}