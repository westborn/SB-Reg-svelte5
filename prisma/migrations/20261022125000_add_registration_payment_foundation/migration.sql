-- CreateEnum
CREATE TYPE "registration_state" AS ENUM ('draft', 'submitted');

-- CreateEnum
CREATE TYPE "payment_state" AS ENUM ('unpaid', 'processing', 'paid', 'waived', 'needs_review');

-- AlterTable
ALTER TABLE "registration"
ADD COLUMN "registration_state" "registration_state" NOT NULL DEFAULT 'draft';

-- Backfill retained registrations without inferring any payment outcome.
UPDATE "registration"
SET "registration_state" = 'submitted'
WHERE "closed" = true;

-- CreateTable
CREATE TABLE "registration_payment" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "payment_state" "payment_state" NOT NULL DEFAULT 'unpaid',
    "fee_in_cents" INTEGER NOT NULL,
    "payment_attempt_key" TEXT,
    "square_payment_id" TEXT,
    "square_location_id" TEXT,
    "currency" VARCHAR(3),
    "receipt_url" TEXT,
    "resolved_at" TIMESTAMP(6),
    "confirmation_email_sent_at" TIMESTAMP(6),
    "confirmation_email_error" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_payment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "registration_payment_fee_in_cents_check" CHECK ("fee_in_cents" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_artist_id_registration_year_key"
ON "registration"("artist_id", "registration_year");

-- CreateIndex
CREATE UNIQUE INDEX "registration_payment_registration_id_key"
ON "registration_payment"("registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_payment_payment_attempt_key_key"
ON "registration_payment"("payment_attempt_key");

-- CreateIndex
CREATE UNIQUE INDEX "registration_payment_square_payment_id_key"
ON "registration_payment"("square_payment_id");

-- CreateIndex
CREATE INDEX "registration_payment_state_updated_at_idx"
ON "registration_payment"("payment_state", "updated_at");

-- AddForeignKey
ALTER TABLE "registration_payment"
ADD CONSTRAINT "registration_payment_registration_id_fkey"
FOREIGN KEY ("registration_id") REFERENCES "registration"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
