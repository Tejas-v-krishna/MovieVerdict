/*
  Warnings:

  - You are about to drop the column `fromLabel` on the `VerdictHistory` table. All the data in the column will be lost.
  - You are about to drop the column `toLabel` on the `VerdictHistory` table. All the data in the column will be lost.
  - Added the required column `toVerdict` to the `VerdictHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerdictHistory" DROP COLUMN "fromLabel",
DROP COLUMN "toLabel",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "fromVerdict" "Verdict",
ADD COLUMN     "shortVerdict" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "toVerdict" "Verdict" NOT NULL;
