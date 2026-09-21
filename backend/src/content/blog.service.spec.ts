import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { BlogService } from './blog.service';

function baseBlog(overrides: Partial<any> = {}) {
  return {
    id: 'blog-1',
    title: 'Airport Transfer Tips',
    slug: 'airport-transfer-tips',
    excerpt: null,
    content: 'Content body',
    featuredImageUrl: null,
    category: null,
    status: ContentStatus.DRAFT,
    metaTitle: null,
    metaDescription: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('BlogService', () => {
  let prisma: { blog: { create: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock; update: jest.Mock; delete: jest.Mock; findFirst: jest.Mock } };
  let service: BlogService;

  beforeEach(() => {
    prisma = {
      blog: {
        create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(),
        update: jest.fn(), delete: jest.fn(), findFirst: jest.fn(),
      },
    };
    service = new BlogService(prisma as any);
  });

  it('creates a blog, slugifying the title when no slug is given', async () => {
    prisma.blog.findUnique.mockResolvedValue(null);
    prisma.blog.create.mockResolvedValue(baseBlog());

    await service.create({ title: 'Airport Transfer Tips', content: 'Content body' } as any);

    expect(prisma.blog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'airport-transfer-tips' }) }),
    );
  });

  it('rejects creating a blog with a slug that already exists', async () => {
    prisma.blog.findUnique.mockResolvedValue(baseBlog());
    await expect(service.create({ title: 'Airport Transfer Tips', content: 'x' } as any)).rejects.toThrow(
      ConflictException,
    );
  });

  it('sets publishedAt when created directly as PUBLISHED', async () => {
    prisma.blog.findUnique.mockResolvedValue(null);
    prisma.blog.create.mockImplementation(({ data }: any) => Promise.resolve(baseBlog(data)));

    await service.create({ title: 'X', content: 'Y', status: ContentStatus.PUBLISHED } as any);

    const createArg = prisma.blog.create.mock.calls[0][0].data;
    expect(createArg.publishedAt).toBeInstanceOf(Date);
  });

  it('throws NotFoundException for an unknown id', async () => {
    prisma.blog.findUnique.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toThrow(NotFoundException);
  });

  it('sets publishedAt the first time a post is published via updateStatus', async () => {
    prisma.blog.findUnique.mockResolvedValue(baseBlog({ status: ContentStatus.DRAFT, publishedAt: null }));
    prisma.blog.update.mockImplementation(({ data }: any) => Promise.resolve(baseBlog(data)));

    const result = await service.updateStatus('blog-1', ContentStatus.PUBLISHED);

    expect(result.publishedAt).toBeInstanceOf(Date);
  });

  it('does not overwrite publishedAt on a repeat publish/unpublish cycle', async () => {
    const firstPublished = new Date('2026-01-01T00:00:00.000Z');
    prisma.blog.findUnique.mockResolvedValue(baseBlog({ status: ContentStatus.PUBLISHED, publishedAt: firstPublished }));
    prisma.blog.update.mockImplementation(({ data }: any) => Promise.resolve(baseBlog(data)));

    const result = await service.updateStatus('blog-1', ContentStatus.DRAFT);
    expect(result.publishedAt).toEqual(firstPublished);
  });

  it('only lists published posts for the public read path', async () => {
    prisma.blog.findMany.mockResolvedValue([baseBlog({ status: ContentStatus.PUBLISHED })]);
    await service.listPublished();
    expect(prisma.blog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: ContentStatus.PUBLISHED } }),
    );
  });

  it('does not return a draft post via the public slug lookup', async () => {
    prisma.blog.findFirst.mockResolvedValue(null);
    await expect(service.getPublishedBySlug('some-draft')).rejects.toThrow(NotFoundException);
    expect(prisma.blog.findFirst).toHaveBeenCalledWith({
      where: { slug: 'some-draft', status: ContentStatus.PUBLISHED },
    });
  });

  it('deletes an existing blog', async () => {
    prisma.blog.findUnique.mockResolvedValue(baseBlog());
    await service.delete('blog-1');
    expect(prisma.blog.delete).toHaveBeenCalledWith({ where: { id: 'blog-1' } });
  });
});