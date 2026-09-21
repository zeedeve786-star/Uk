import { NotificationRecipientType, NotificationType } from '@prisma/client';

export interface NotificationResult {
  id: string;
  type: NotificationType;
  recipientType: NotificationRecipientType;
  recipientUserId: string | null;
  recipientContact: string | null;
  referenceType: string;
  referenceId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
