import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { slugify } from './slugify.util';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.blog.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('A blog post with this slug already exists');
    }
  }

  async create(dto: CreateBlogDto) {
    const slug = slugify(dto.slug ?? dto.title);
    await this.ensureUniqueSlug(slug);

    return this.prisma.blog.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImageUrl: dto.featuredImageUrl,
        category: dto.category,
        status: dto.status ?? ContentStatus.DRAFT,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  async list() {
    return this.prisma.blog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      throw new NotFoundException('Blog post not found');
    }
    return blog;
  }

  async update(id: string, dto: UpdateBlogDto) {
    await this.getById(id);
    if (dto.slug) {
      const normalizedSlug = slugify(dto.slug);
      await this.ensureUniqueSlug(normalizedSlug, id);
      dto = { ...dto, slug: normalizedSlug };
    }
    return this.prisma.blog.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: ContentStatus) {
    const blog = await this.getById(id);
    return this.prisma.blog.update({
      where: { id },
      data: {
        status,
        // publishedAt is set the first time a post is published and never
        // cleared on unpublish, preserving original publish history.
        publishedAt: status === ContentStatus.PUBLISHED && !blog.publishedAt ? new Date() : blog.publishedAt,
      },
    });
  }

  async delete(id: string) {
    await this.getById(id);
    await this.prisma.blog.delete({ where: { id } });
  }

  // --- Public (published-only) reads ---

  async listPublished() {
    return this.prisma.blog.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getPublishedBySlug(slug: string) {
    const blog = await this.prisma.blog.findFirst({ where: { slug, status: ContentStatus.PUBLISHED } });
    if (!blog) {
      throw new NotFoundException('Blog post not found');
    }
    return blog;
  }
}