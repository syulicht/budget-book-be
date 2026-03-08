-- AlterTable
ALTER TABLE `category` MODIFY `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `budget` MODIFY `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `subscription` MODIFY `user_id` VARCHAR(191) NOT NULL;
