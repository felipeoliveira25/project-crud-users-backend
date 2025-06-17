-- CreateTable
CREATE TABLE "Admin" (
    "id" SMALLSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" VARCHAR NOT NULL DEFAULT '',
    "password" VARCHAR NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SMALLSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR NOT NULL DEFAULT '',
    "email" VARCHAR NOT NULL DEFAULT '',
    "telephone" VARCHAR NOT NULL DEFAULT '',
    "role" VARCHAR NOT NULL DEFAULT '',
    "age" SMALLINT NOT NULL,
    "salary" VARCHAR NOT NULL DEFAULT '',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
