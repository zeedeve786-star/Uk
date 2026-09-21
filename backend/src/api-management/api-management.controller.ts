import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiIntegrationStatus } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { ApiManagementService } from './api-management.service';
import { RequireMasterAdmin } from '../admin/decorators/require-master-admin.decorator';

@Controller('admin/api-management')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequireMasterAdmin()
export class ApiManagementController {
  constructor(private readonly service: ApiManagementService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      provider: string;
      baseUrl: string;
      apiKey?: string;
      description?: string;
      status?: ApiIntegrationStatus;
    },
  ) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      provider?: string;
      baseUrl?: string;
      apiKey?: string;
      description?: string;
      status?: ApiIntegrationStatus;
    },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
