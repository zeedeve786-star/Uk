import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, ServiceContentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceContentDto } from './dto/create-service-content.dto';
import { UpdateServiceContentDto } from './dto/update-service-content.dto';
import { slugify } from './slugify.util';

@Injectable()
export class ServiceContentService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.serviceContent.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Service content with this slug already exists');
    }
  }

  async create(dto: CreateServiceContentDto) {
    const slug = slugify(dto.slug ?? dto.title);
    await this.ensureUniqueSlug(slug);

    return this.prisma.serviceContent.create({
      data: {
        type: dto.type,
        title: dto.title,
        slug,
        description: dto.description,
        eventType: dto.eventType,
        imageUrls: dto.imageUrls ?? [],
        videoUrls: dto.videoUrls ?? [],
        relatedBlogSlugs: dto.relatedBlogSlugs ?? [],
        status: dto.status ?? ContentStatus.DRAFT,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
      },
    });
  }

  async list() {
    return this.prisma.serviceContent.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    const entry = await this.prisma.serviceContent.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Service content not found');
    }
    return entry;
  }

  async update(id: string, dto: UpdateServiceContentDto) {
    await this.getById(id);
    if (dto.slug) {
      const normalizedSlug = slugify(dto.slug);
      await this.ensureUniqueSlug(normalizedSlug, id);
      dto = { ...dto, slug: normalizedSlug };
    }
    return this.prisma.serviceContent.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: ContentStatus) {
    await this.getById(id);
    return this.prisma.serviceContent.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    await this.getById(id);
    await this.prisma.serviceContent.delete({ where: { id } });
  }

  // --- Public (published-only) reads ---

  async listPublishedByType(type: ServiceContentType) {
    return this.prisma.serviceContent.findMany({
      where: { type, status: ContentStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublishedBySlug(slug: string) {
    const entry = await this.prisma.serviceContent.findFirst({ where: { slug, status: ContentStatus.PUBLISHED } });
    if (!entry) {
      throw new NotFoundException('Service content not found');
    }
    return entry;
  }
}