-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Da Osservare';

-- CreateTable
CREATE TABLE "PlayerHistory" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER NOT NULL,
    "marketValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PlayerHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerHistory" ADD CONSTRAINT "PlayerHistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
