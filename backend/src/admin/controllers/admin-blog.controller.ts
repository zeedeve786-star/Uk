import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { BlogService } from '../../content/blog.service';
import { CreateBlogDto } from '../../content/dto/create-blog.dto';
import { UpdateBlogDto } from '../../content/dto/update-blog.dto';
import { UpdateContentStatusDto } from '../../content/dto/update-content-status.dto';

@Controller('admin/content/blogs')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_CONTENT)
export class AdminBlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  list() {
    return this.blogService.list();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.blogService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateBlogDto, @CurrentAdmin() actor: AdminRequestUser) {
    const blog = await this.blogService.create(dto);
    await this.auditService.record(actor.id, 'CREATE_BLOG', 'Blog', blog.id, { title: blog.title });
    return blog;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto, @CurrentAdmin() actor: AdminRequestUser) {
    const blog = await this.blogService.update(id, dto);
    await this.auditService.record(actor.id, 'UPDATE_BLOG', 'Blog', blog.id);
    return blog;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContentStatusDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const blog = await this.blogService.updateStatus(id, dto.status);
    await this.auditService.record(actor.id, 'UPDATE_BLOG_STATUS', 'Blog', blog.id, { status: dto.status });
    return blog;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentAdmin() actor: AdminRequestUser) {
    await this.blogService.delete(id);
    await this.auditService.record(actor.id, 'DELETE_BLOG', 'Blog', id);
    return { deleted: true };
  }
}