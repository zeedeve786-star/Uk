CREATE TYPE "VehicleCategory" AS ENUM ('saloon', 'estate', 'mpv', 'executive', 'eight-seater');

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "extraStops" JSONB,
    "journeyDate" DATE NOT NULL,
    "journeyTime" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "passengerCount" INTEGER NOT NULL,
    "vehicleCategory" "VehicleCategory" NOT NULL,
    "originalFarePence" INTEGER NOT NULL,
    "discountCode" TEXT,
    "discountAmountPence" INTEGER NOT NULL DEFAULT 0,
    "finalFarePence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "bookingStatus" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Booking_bookingReference_key"
ON "Booking"("bookingReference");