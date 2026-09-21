import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDatabase() {
    const written = await this.prisma.healthCheck.create({ data: {} });
    const read = await this.prisma.healthCheck.findUniqueOrThrow({ where: { id: written.id } });

    return {
      connected: true,
      verified: read.id === written.id,
      recordedAt: read.checkedAt.toISOString(),
    };
  }
}