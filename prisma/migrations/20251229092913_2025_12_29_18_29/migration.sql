/*
  Warnings:

  - You are about to drop the column `type` on the `category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `budget` ALTER COLUMN `date` DROP DEFAULT;

-- AlterTable
ALTER TABLE `budgetbase` ALTER COLUMN `amount` DROP DEFAULT;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `type`,
    ALTER COLUMN `userId` DROP DEFAULT;

-- AlterTable
ALTER TABLE `subscription` ALTER COLUMN `dayOrder` DROP DEFAULT,
    ALTER COLUMN `startDate` DROP DEFAULT,
    ALTER COLUMN `endDate` DROP DEFAULT;
