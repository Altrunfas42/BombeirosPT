/*
  Warnings:

  - You are about to alter the column `status` on the `burnrequest` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.
  - Made the column `description` on table `burnrequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `burnrequest` ADD COLUMN `priority` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    MODIFY `description` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';
