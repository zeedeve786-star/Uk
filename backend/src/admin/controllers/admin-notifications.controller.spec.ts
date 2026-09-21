import { AdminNotificationsController } from './admin-notifications.controller';

describe('AdminNotificationsController', () => {
  it('lists all notifications by default', async () => {
    const notificationService = { list: jest.fn().mockResolvedValue([]) } as any;
    const controller = new AdminNotificationsController(notificationService);
    await controller.list();
    expect(notificationService.list).toHaveBeenCalledWith(false);
  });

  it('lists only unread when requested', async () => {
    const notificationService = { list: jest.fn().mockResolvedValue([]) } as any;
    const controller = new AdminNotificationsController(notificationService);
    await controller.list('true');
    expect(notificationService.list).toHaveBeenCalledWith(true);
  });

  it('marks a notification as read', async () => {
    const notificationService = { markRead: jest.fn().mockResolvedValue({ id: 'notif-1', read: true }) } as any;
    const controller = new AdminNotificationsController(notificationService);
    const result = await controller.markRead('notif-1');
    expect(notificationService.markRead).toHaveBeenCalledWith('notif-1');
    expect(result.read).toBe(true);
  });
});
