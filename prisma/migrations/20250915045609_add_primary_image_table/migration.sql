-- CreateTable
CREATE TABLE "primary_image" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "image_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "primary_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "primary_image_entry_id_key" ON "primary_image"("entry_id");

-- AddForeignKey
ALTER TABLE "primary_image" ADD CONSTRAINT "primary_image_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "primary_image" ADD CONSTRAINT "primary_image_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
