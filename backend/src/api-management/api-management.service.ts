import { Injectable } from '@nestjs/common';
import { ApiIntegrationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiManagementService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.apiIntegration.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: {
    name: string;
    provider: string;
    baseUrl: string;
    apiKey?: string;
    description?: string;
    status?: ApiIntegrationStatus;
  }) {
    return this.prisma.apiIntegration.create({
      data: {
        name: data.name,
        provider: data.provider,
        baseUrl: data.baseUrl,
        apiKey: data.apiKey ?? '',
        description: data.description,
        status: data.status ?? ApiIntegrationStatus.ACTIVE,
      },
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      provider?: string;
      baseUrl?: string;
      apiKey?: string;
      description?: string;
      status?: ApiIntegrationStatus;
    },
  ) {
    return this.prisma.apiIntegration.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.apiIntegration.delete({
      where: { id },
    });
  }
}
