-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "customerNotes" TEXT,
ADD COLUMN     "estimatedDistanceMiles" DOUBLE PRECISION,
ADD COLUMN     "leadPassengerEmail" TEXT,
ADD COLUMN     "leadPassengerName" TEXT,
ADD COLUMN     "leadPassengerPhone" TEXT,
ADD COLUMN     "luggageCount" INTEGER,
ADD COLUMN     "luggageNotes" TEXT,
ADD COLUMN     "paidAmountPence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "partnerBookingReference" TEXT,
ADD COLUMN     "realDistanceMiles" DOUBLE PRECISION,
ADD COLUMN     "validationStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "driverNotes" TEXT,
ADD COLUMN     "realDistanceMiles" DOUBLE PRECISION;
