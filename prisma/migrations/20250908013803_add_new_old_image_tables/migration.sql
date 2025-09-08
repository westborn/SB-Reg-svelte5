-- CreateTable
CREATE TABLE "newimages" (
    "id" BIGSERIAL NOT NULL,
    "cloud_id" TEXT NOT NULL,
    "cloud_url" TEXT NOT NULL,

    CONSTRAINT "newimages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oldimages" (
    "id" BIGSERIAL NOT NULL,
    "cloud_id" TEXT NOT NULL,
    "cloud_url" TEXT NOT NULL,

    CONSTRAINT "oldimages_pkey" PRIMARY KEY ("id")
);
