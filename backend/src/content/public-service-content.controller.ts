import { Controller, Get, Param } from '@nestjs/common';
import { ServiceContentType } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { ServiceContentService } from './service-content.service';

@Controller('content/service-content')
export class PublicServiceContentController {
  constructor(private readonly service: ServiceContentService) {}

  @Get('type/:type')
  listByType(@Param('type') type: string) {
    const normalized = type.toUpperCase() as keyof typeof ServiceContentType;
    if (!(normalized in ServiceContentType)) {
      throw new BadRequestException('Unknown service content type');
    }
    return this.service.listPublishedByType(ServiceContentType[normalized]);
  }

  @Get('slug/:slug')
  getOne(@Param('slug') slug: string) {
    return this.service.getPublishedBySlug(slug);
  }
}