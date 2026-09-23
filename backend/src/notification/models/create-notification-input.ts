import { NotificationRecipientType, NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  type: NotificationType;
  recipientType: NotificationRecipientType;
  recipientUserId?: string;
  recipientContact?: string;
  referenceType: string;
  referenceId: string;
  message: string;
}
