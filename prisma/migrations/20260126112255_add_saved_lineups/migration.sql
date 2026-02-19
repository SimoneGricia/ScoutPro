-- CreateTable
CREATE TABLE "SavedLineup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "lineup" TEXT NOT NULL,

    CONSTRAINT "SavedLineup_pkey" PRIMARY KEY ("id")
);
