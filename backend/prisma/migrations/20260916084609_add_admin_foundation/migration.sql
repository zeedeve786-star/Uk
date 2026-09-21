-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM ('MANAGE_BOOKINGS', 'MANAGE_DISCOUNTS', 'VIEW_FARE_CONFIG', 'MANAGE_ADMINS', 'VIEW_AUDIT_LOG');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminPermissions" "AdminPermission"[] DEFAULT ARRAY[]::"AdminPermission"[],
ADD COLUMN     "isMasterAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);
