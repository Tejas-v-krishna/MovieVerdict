-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "badges" TEXT[] DEFAULT ARRAY[]::TEXT[];
