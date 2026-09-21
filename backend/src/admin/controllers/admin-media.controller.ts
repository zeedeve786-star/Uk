import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { MediaService } from '../../media/media.service';
import { CreateMediaAssetDto } from '../../media/dto/create-media-asset.dto';

// Media management is part of content management — reuses MANAGE_CONTENT
// rather than introducing a separate permission for what is, functionally,
// a sub-area of the same content workflow.
@Controller('admin/media')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_CONTENT)
export class AdminMediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  list() {
    return this.mediaService.list();
  }

  @Post()
  async create(@Body() dto: CreateMediaAssetDto, @CurrentAdmin() actor: AdminRequestUser) {
    const asset = await this.mediaService.create(dto);
    await this.auditService.record(actor.id, 'CREATE_MEDIA_ASSET', 'MediaAsset', asset.id, { mediaType: asset.mediaType });
    return asset;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentAdmin() actor: AdminRequestUser) {
    await this.mediaService.delete(id);
    await this.auditService.record(actor.id, 'DELETE_MEDIA_ASSET', 'MediaAsset', id);
    return { deleted: true };
  }
}