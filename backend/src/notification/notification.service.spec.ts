import { NotFoundException } from '@nestjs/common';
import { NotificationRecipientType, NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service';

function baseNotification(overrides: Partial<any> = {}) {
  return {
    id: 'notif-1',
    type: NotificationType.BOOKING_CREATED,
    recipientType: NotificationRecipientType.CUSTOMER,
    recipientUserId: null,
    recipientContact: 'jane@example.com',
    referenceType: 'Booking',
    referenceId: 'BK-1',
    message: 'Booking BK-1 created.',
    read: false,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('NotificationService', () => {
  let prisma: any;
  let service: NotificationService;

  beforeEach(() => {
    prisma = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new NotificationService(prisma);
  });

  it('persists a notification for a real event', async () => {
    prisma.notification.create.mockResolvedValue(baseNotification());
    await service.notify({
      type: NotificationType.BOOKING_CREATED,
      recipientType: NotificationRecipientType.CUSTOMER,
      recipientContact: 'jane@example.com',
      referenceType: 'Booking',
      referenceId: 'BK-1',
      message: 'Booking BK-1 created.',
    });
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: NotificationType.BOOKING_CREATED }),
    });
  });

  it('swallows a persistence failure without throwing', async () => {
    prisma.notification.create.mockRejectedValue(new Error('db down'));
    await expect(
      service.notify({
        type: NotificationType.BOOKING_CREATED,
        recipientType: NotificationRecipientType.CUSTOMER,
        recipientContact: 'jane@example.com',
        referenceType: 'Booking',
        referenceId: 'BK-1',
        message: 'x',
      }),
    ).resolves.toBeUndefined();
  });

  it('lists only unread notifications when requested', async () => {
    prisma.notification.findMany.mockResolvedValue([]);
    await service.list(true);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { read: false } }),
    );
  });

  it('lists all notifications by default', async () => {
    prisma.notification.findMany.mockResolvedValue([]);
    await service.list();
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('marks a notification as read', async () => {
    prisma.notification.findUnique.mockResolvedValue(baseNotification());
    prisma.notification.update.mockResolvedValue(baseNotification({ read: true }));
    const result = await service.markRead('notif-1');
    expect(result.read).toBe(true);
  });

  it('throws NotFoundException for an unknown notification', async () => {
    prisma.notification.findUnique.mockResolvedValue(null);
    await expect(service.markRead('missing')).rejects.toThrow(NotFoundException);
  });
});
