import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaAssetDto } from './dto/create-media-asset.dto';
import { extensionMatchesType, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from './media-extensions';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMediaAssetDto) {
    if (!extensionMatchesType(dto.url, dto.mediaType)) {
      const allowed = dto.mediaType === 'IMAGE' ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS;
      throw new BadRequestException(
        `URL does not look like a ${dto.mediaType.toLowerCase()} file (expected one of: ${allowed.join(', ')})`,
      );
    }

    return this.prisma.mediaAsset.create({
      data: { url: dto.url, altText: dto.altText, mediaType: dto.mediaType },
    });
  }

  async list() {
    return this.prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async delete(id: string) {
    const existing = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Media asset not found');
    }

    const vehicleEntries = await this.prisma.vehicleContent.findMany({
      where: {
        OR: [
          { imageUrls: { has: existing.url } },
          { videoUrls: { has: existing.url } },
        ],
      },
      select: {
        id: true,
        imageUrls: true,
        videoUrls: true,
      },
    });

    for (const entry of vehicleEntries) {
      await this.prisma.vehicleContent.update({
        where: { id: entry.id },
        data: {
          imageUrls: entry.imageUrls.filter((url) => url !== existing.url),
          videoUrls: entry.videoUrls.filter((url) => url !== existing.url),
        },
      });
    }

    await this.prisma.mediaAsset.delete({ where: { id } });
  }
}