-- AlterEnum
ALTER TYPE "AdminPermission" ADD VALUE 'VIEW_NOTIFICATIONS';

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
    'BOOKING_CREATED',
    'PAYMENT_SUCCEEDED',
    'PAYMENT_FAILED',
    'RIDE_STATUS_CHANGED',
    'DRIVER_ASSIGNED'
);

-- CreateEnum
CREATE TYPE "NotificationRecipientType" AS ENUM (
    'CUSTOMER',
    'DRIVER',
    'ADMIN'
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "recipientType" "NotificationRecipientType" NOT NULL,
    "recipientUserId" TEXT,
    "recipientContact" TEXT,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
