-- CreateTable
CREATE TABLE "MatchLog" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opponent" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "minutesPlayed" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellowCard" BOOLEAN NOT NULL DEFAULT false,
    "redCard" BOOLEAN NOT NULL DEFAULT false,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "cleanSheet" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MatchLog" ADD CONSTRAINT "MatchLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
