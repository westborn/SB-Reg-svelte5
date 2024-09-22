-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "exhibit_number" TEXT NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_exhibit_number_key" ON "location"("exhibit_number");

-- CreateIndex
CREATE UNIQUE INDEX "location_entry_id_key" ON "location"("entry_id");

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
