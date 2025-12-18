-- CreateTable
CREATE TABLE "Invites" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invites_code_key" ON "Invites"("code");

-- AddForeignKey
ALTER TABLE "Invites" ADD CONSTRAINT "Invites_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "Servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
