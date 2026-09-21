-- AlterEnum
ALTER TYPE "AdminPermission" ADD VALUE 'MANAGE_AVAILABILITY';

-- CreateTable
CREATE TABLE "AvailabilityBlock" (
    "id" TEXT NOT NULL,
    "vehicleCategory" "VehicleCategory" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvailabilityBlock_vehicleCategory_startsAt_endsAt_idx" ON "AvailabilityBlock"("vehicleCategory", "startsAt", "endsAt");
