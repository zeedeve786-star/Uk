import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContentStatus, ServiceContentType } from '@prisma/client';
import { ServiceContentService } from './service-content.service';

function baseEntry(overrides: Partial<any> = {}) {
  return {
    id: 'sc-1',
    type: ServiceContentType.AIRPORT,
    title: 'Airport Transfers',
    slug: 'airport-transfers',
    description: 'Description',
    eventType: null,
    imageUrls: [],
    videoUrls: [],
    relatedBlogSlugs: [],
    status: ContentStatus.DRAFT,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ServiceContentService', () => {
  let prisma: any;
  let service: ServiceContentService;

  beforeEach(() => {
    prisma = {
      serviceContent: {
        create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(),
        update: jest.fn(), delete: jest.fn(), findFirst: jest.fn(),
      },
    };
    service = new ServiceContentService(prisma);
  });

  it('creates airport content with a slugified title', async () => {
    prisma.serviceContent.findUnique.mockResolvedValue(null);
    prisma.serviceContent.create.mockResolvedValue(baseEntry());

    await service.create({ type: ServiceContentType.AIRPORT, title: 'Airport Transfers', description: 'Description' } as any);

    expect(prisma.serviceContent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'airport-transfers', type: ServiceContentType.AIRPORT }) }),
    );
  });

  it('rejects a duplicate slug across content types', async () => {
    prisma.serviceContent.findUnique.mockResolvedValue(baseEntry());
    await expect(
      service.create({ type: ServiceContentType.RAILWAY, title: 'Airport Transfers', description: 'x' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('lists only published entries for a given type on the public path', async () => {
    prisma.serviceContent.findMany.mockResolvedValue([]);
    await service.listPublishedByType(ServiceContentType.EVENT);
    expect(prisma.serviceContent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { type: ServiceContentType.EVENT, status: ContentStatus.PUBLISHED } }),
    );
  });

  it('throws NotFoundException for an unknown id', async () => {
    prisma.serviceContent.findUnique.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toThrow(NotFoundException);
  });

  it('does not expose a draft entry via the public slug lookup', async () => {
    prisma.serviceContent.findFirst.mockResolvedValue(null);
    await expect(service.getPublishedBySlug('draft-entry')).rejects.toThrow(NotFoundException);
  });

  it('stores eventType only meaningfully alongside type = EVENT content', async () => {
    prisma.serviceContent.findUnique.mockResolvedValue(null);
    prisma.serviceContent.create.mockImplementation(({ data }: any) => Promise.resolve(baseEntry(data)));

    await service.create({
      type: ServiceContentType.EVENT,
      title: 'Wedding Transport',
      description: 'x',
      eventType: 'Wedding',
    } as any);

    const createArg = prisma.serviceContent.create.mock.calls[0][0].data;
    expect(createArg.eventType).toBe('Wedding');
  });
});