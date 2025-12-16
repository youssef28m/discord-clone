-- CreateTable
CREATE TABLE "Servers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Servers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Servers" ADD CONSTRAINT "Servers_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
