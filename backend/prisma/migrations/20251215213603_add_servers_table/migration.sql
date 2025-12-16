-- CreateTable
CREATE TABLE "Channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "server_members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Channels" ADD CONSTRAINT "Channels_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "Servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_members" ADD CONSTRAINT "server_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_members" ADD CONSTRAINT "server_members_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "Servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
