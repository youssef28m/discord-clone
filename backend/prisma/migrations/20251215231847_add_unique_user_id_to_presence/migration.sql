/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Presence` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Presence_user_id_key" ON "Presence"("user_id");
