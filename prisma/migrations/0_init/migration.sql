-- CreateEnum
CREATE TYPE "indigenous" AS ENUM ('Yes', 'No', 'Declined');

-- CreateEnum
CREATE TYPE "entry_type" AS ENUM ('Indoor', 'Outdoor');

-- CreateTable
CREATE TABLE "artist" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "first_nations" "indigenous" NOT NULL DEFAULT 'No',
    "bank_account_name" TEXT,
    "bank_bsb" TEXT,
    "bank_account" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration" (
    "id" SERIAL NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "registration_year" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "bump_in" TEXT,
    "bump_out" TEXT,
    "display_requirements" TEXT,
    "accommodation" BOOLEAN NOT NULL DEFAULT false,
    "crane" BOOLEAN NOT NULL DEFAULT false,
    "transport" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry" (
    "id" SERIAL NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "registration_id" INTEGER NOT NULL,
    "description" TEXT,
    "dimensions" TEXT,
    "enter_major_prize" BOOLEAN NOT NULL DEFAULT false,
    "in_or_out" "entry_type" NOT NULL,
    "material" TEXT,
    "price_in_cents" INTEGER NOT NULL,
    "special_requirements" TEXT,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" SERIAL NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "registration_id" INTEGER,
    "entry_id" INTEGER,
    "cloud_id" TEXT NOT NULL,
    "cloud_url" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artist_email_key" ON "artist"("email");

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry" ADD CONSTRAINT "entry_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry" ADD CONSTRAINT "entry_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

