-- CreateEnum
CREATE TYPE "DriverPaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "DriverPaymentProvider" AS ENUM ('INTERNAL', 'STRIPE_CONNECT', 'BANK_API', 'OTHER');

-- AlterEnum
ALTER TYPE "DriverPaymentStatus" ADD VALUE 'APPROVED';
ALTER TYPE "DriverPaymentStatus" ADD VALUE 'TRANSFER_INITIATED';
ALTER TYPE "DriverPaymentStatus" ADD VALUE 'FAILED';
ALTER TYPE "DriverPaymentStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "DriverPayment"
ADD COLUMN "paymentMethod" "DriverPaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
ADD COLUMN "provider" "DriverPaymentProvider" NOT NULL DEFAULT 'INTERNAL',
ADD COLUMN "transferReference" TEXT,
ADD COLUMN "externalTransactionId" TEXT,
ADD COLUMN "payrollPeriodStart" DATE,
ADD COLUMN "payrollPeriodEnd" DATE,
ADD COLUMN "rideCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "createdByUserId" TEXT,
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "transferredAt" TIMESTAMP(3),
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "failedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Ride"
ADD COLUMN "driverEarningPence" INTEGER,
ADD COLUMN "driverEarningSource" TEXT,
ADD COLUMN "driverEarningLocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "DriverPayment_driverId_payrollPeriodStart_payrollPeriodEnd_idx"
ON "DriverPayment"("driverId", "payrollPeriodStart", "payrollPeriodEnd");

-- CreateIndex
CREATE INDEX "DriverPayment_externalTransactionId_idx"
ON "DriverPayment"("externalTransactionId");
