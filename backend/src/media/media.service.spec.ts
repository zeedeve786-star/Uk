import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let prisma: { mediaAsset: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; delete: jest.Mock } };
  let service: MediaService;

  beforeEach(() => {
    prisma = { mediaAsset: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() } };
    service = new MediaService(prisma as any);
  });

  it('creates a valid image asset', async () => {
    prisma.mediaAsset.create.mockResolvedValue({ id: 'm1', url: 'https://example.com/photo.jpg', mediaType: MediaType.IMAGE });
    const result = await service.create({ url: 'https://example.com/photo.jpg', mediaType: MediaType.IMAGE });
    expect(result.id).toBe('m1');
  });

  it('creates a valid video asset', async () => {
    prisma.mediaAsset.create.mockResolvedValue({ id: 'm2', url: 'https://example.com/clip.mp4', mediaType: MediaType.VIDEO });
    const result = await service.create({ url: 'https://example.com/clip.mp4', mediaType: MediaType.VIDEO });
    expect(result.id).toBe('m2');
  });

  it('rejects an image URL with a video extension', async () => {
    await expect(
      service.create({ url: 'https://example.com/clip.mp4', mediaType: MediaType.IMAGE }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.mediaAsset.create).not.toHaveBeenCalled();
  });

  it('rejects a video URL with an image extension', async () => {
    await expect(
      service.create({ url: 'https://example.com/photo.jpg', mediaType: MediaType.VIDEO }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a URL with no recognizable extension', async () => {
    await expect(
      service.create({ url: 'https://example.com/media', mediaType: MediaType.IMAGE }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lists assets ordered by most recent', async () => {
    prisma.mediaAsset.findMany.mockResolvedValue([]);
    await service.list();
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
  });

  it('throws NotFoundException when deleting an unknown asset', async () => {
    prisma.mediaAsset.findUnique.mockResolvedValue(null);
    await expect(service.delete('missing')).rejects.toThrow(NotFoundException);
  });

  it('deletes an existing asset', async () => {
    prisma.mediaAsset.findUnique.mockResolvedValue({ id: 'm1' });
    await service.delete('m1');
    expect(prisma.mediaAsset.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
  });
});