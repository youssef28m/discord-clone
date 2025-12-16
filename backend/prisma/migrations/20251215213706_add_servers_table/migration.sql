/*
  Warnings:

  - You are about to drop the column `createdAt` on the `server_members` table. All the data in the column will be lost.
  - Added the required column `role` to the `server_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "server_members" DROP COLUMN "createdAt",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" TEXT NOT NULL;
