/*
  Warnings:

  - Added the required column `type` to the `Bill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Bill` ADD COLUMN `extralInfo` JSON NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('DATA', 'AIRTIME', 'UTILITY') NOT NULL;

-- AlterTable
ALTER TABLE `Transaction` MODIFY `type` ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'RECHARGE', 'PAYMENT') NOT NULL;
