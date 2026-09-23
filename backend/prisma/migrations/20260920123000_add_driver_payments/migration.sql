-- AlterEnum
ALTER TYPE "AdminPermission" ADD VALUE 'MANAGE_DRIVER_PAYMENTS';

-- CreateEnum
CREATE TYPE "DriverPaymentFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "DriverPaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "DriverPayment" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "frequency" "DriverPaymentFrequency" NOT NULL,
    "amountPence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "paymentDate" DATE NOT NULL,
    "status" "DriverPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverPayment_driverId_paymentDate_idx" ON "DriverPayment"("driverId", "paymentDate");

-- CreateIndex
CREATE INDEX "DriverPayment_status_idx" ON "DriverPayment"("status");

-- AddForeignKey
ALTER TABLE "DriverPayment"
ADD CONSTRAINT "DriverPayment_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "DriverProfile"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
