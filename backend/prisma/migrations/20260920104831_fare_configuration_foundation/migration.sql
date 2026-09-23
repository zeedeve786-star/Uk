-- CreateEnum
CREATE TYPE "DriverEarningRuleType" AS ENUM ('NONE', 'FIXED', 'PERCENTAGE');

-- CreateTable
CREATE TABLE "FareConfiguration" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "baseFarePence" INTEGER NOT NULL,
    "perMilePence" INTEGER NOT NULL,
    "perExtraStopPence" INTEGER NOT NULL,
    "minimumFarePence" INTEGER NOT NULL,
    "saloonMultiplier" DOUBLE PRECISION NOT NULL,
    "estateMultiplier" DOUBLE PRECISION NOT NULL,
    "mpvMultiplier" DOUBLE PRECISION NOT NULL,
    "executiveMultiplier" DOUBLE PRECISION NOT NULL,
    "eightSeaterMultiplier" DOUBLE PRECISION NOT NULL,
    "driverEarningRuleType" "DriverEarningRuleType" NOT NULL DEFAULT 'NONE',
    "driverEarningValue" DOUBLE PRECISION,
    "companyChargePence" INTEGER,
    "companyChargePercentage" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FareConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FareConfiguration_active_idx" ON "FareConfiguration"("active");
