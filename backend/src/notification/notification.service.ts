import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationInput } from './models/create-notification-input';
import { NotificationResult } from './models/notification-result';

function toResult(record: any): NotificationResult {
  return {
    id: record.id,
    type: record.type,
    recipientType: record.recipientType,
    recipientUserId: record.recipientUserId,
    recipientContact: record.recipientContact,
    referenceType: record.referenceType,
    referenceId: record.referenceId,
    message: record.message,
    read: record.read,
    createdAt: record.createdAt.toISOString(),
  };
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Never throws — a notification failure must not corrupt the calling
  // booking/payment/ride transaction. Failures are logged, not surfaced.
  async notify(input: CreateNotificationInput): Promise<void> {
    try {
      await this.prisma.notification.create({ data: input });
    } catch (error) {
      this.logger.error(`Failed to persist notification (${input.type})`, error as Error);
    }
  }

  async list(onlyUnread = false): Promise<NotificationResult[]> {
    const records = await this.prisma.notification.findMany({
      where: onlyUnread ? { read: false } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toResult);
  }

  async markRead(id: string): Promise<NotificationResult> {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Notification not found');
    }
    const record = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return toResult(record);
  }
}
