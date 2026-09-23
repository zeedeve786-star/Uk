-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT,
    "phoneDisplay" TEXT,
    "phoneTel" TEXT,
    "whatsappNumber" TEXT,
    "contactEmail" TEXT,
    "logoUrl" TEXT,
    "tickerMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);