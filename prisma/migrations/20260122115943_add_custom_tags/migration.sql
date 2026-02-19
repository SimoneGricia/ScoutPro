-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "customTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
