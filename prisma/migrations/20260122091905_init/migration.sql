-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "playerName" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "playerAge" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "mainRole" TEXT NOT NULL,
    "specificRoles" TEXT[],
    "preferredFoot" TEXT NOT NULL,
    "weakFoot" INTEGER NOT NULL,
    "attributes" TEXT[],
    "rating" INTEGER NOT NULL,
    "recommendation" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "pace" INTEGER NOT NULL,
    "shooting" INTEGER NOT NULL,
    "passing" INTEGER NOT NULL,
    "dribbling" INTEGER NOT NULL,
    "defending" INTEGER NOT NULL,
    "physical" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
