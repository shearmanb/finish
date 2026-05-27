-- CreateEnum
CREATE TYPE "BottleStatus" AS ENUM ('SEALED', 'OPEN', 'FINISHED');

-- CreateEnum
CREATE TYPE "Prep" AS ENUM ('NEAT', 'WATER', 'ICE');

-- CreateEnum
CREATE TYPE "PourUnit" AS ENUM ('OZ', 'ML');

-- CreateEnum
CREATE TYPE "ScaleType" AS ENUM ('NUMERIC', 'STAR');

-- CreateEnum
CREATE TYPE "Intensity" AS ENUM ('LIGHT', 'MEDIUM', 'STRONG');

-- CreateTable
CREATE TABLE "Distillery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Distillery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Glassware" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Glassware_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mouthfeel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mouthfeel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TastingPhase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TastingPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingDimension" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scaleType" "ScaleType" NOT NULL DEFAULT 'NUMERIC',
    "minValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxValue" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "step" DOUBLE PRECISION,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatingDimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingScaleAnchor" (
    "id" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "RatingScaleAnchor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlavorCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlavorCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flavor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flavor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidedStep" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "capturesNote" BOOLEAN NOT NULL DEFAULT true,
    "capturesFlavors" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuidedStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Line" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distilleryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bottle" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "name" TEXT,
    "proof" DECIMAL(6,2),
    "singleBarrel" BOOLEAN NOT NULL DEFAULT false,
    "caskStrength" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "mashBill" TEXT,
    "ageStatement" TEXT,
    "release" TEXT,
    "t8kePick" BOOLEAN NOT NULL DEFAULT false,
    "bottleNumber" TEXT,
    "finish" TEXT,
    "producerNotes" TEXT,
    "status" "BottleStatus" NOT NULL DEFAULT 'SEALED',
    "fillLevel" INTEGER,
    "purchaseDate" TIMESTAMP(3),
    "storeId" TEXT,
    "pricePaid" DECIMAL(10,2),
    "msrp" DECIMAL(10,2),
    "storageLocation" TEXT,
    "notes" TEXT,
    "openedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bottle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BottlePhoto" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BottlePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pour" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "pourNumber" INTEGER NOT NULL,
    "pouredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationId" TEXT,
    "companions" TEXT,
    "glasswareId" TEXT,
    "prep" "Prep" NOT NULL DEFAULT 'NEAT',
    "prepNote" TEXT,
    "pourSize" DOUBLE PRECISION,
    "pourSizeUnit" "PourUnit" NOT NULL DEFAULT 'OZ',
    "isGuided" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PourPhaseNote" (
    "id" TEXT NOT NULL,
    "pourId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "PourPhaseNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PourFlavor" (
    "id" TEXT NOT NULL,
    "pourId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "flavorId" TEXT NOT NULL,
    "intensity" "Intensity",

    CONSTRAINT "PourFlavor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PourMouthfeel" (
    "id" TEXT NOT NULL,
    "pourId" TEXT NOT NULL,
    "mouthfeelId" TEXT NOT NULL,

    CONSTRAINT "PourMouthfeel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PourRating" (
    "id" TEXT NOT NULL,
    "pourId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PourRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "lineId" TEXT,
    "freeTextName" TEXT,
    "notes" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "targetPrice" DECIMAL(10,2),
    "acquired" BOOLEAN NOT NULL DEFAULT false,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Distillery_name_key" ON "Distillery"("name");
CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");
CREATE UNIQUE INDEX "Glassware_name_key" ON "Glassware"("name");
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");
CREATE UNIQUE INDEX "Mouthfeel_name_key" ON "Mouthfeel"("name");
CREATE UNIQUE INDEX "TastingPhase_name_key" ON "TastingPhase"("name");
CREATE UNIQUE INDEX "RatingDimension_name_key" ON "RatingDimension"("name");
CREATE UNIQUE INDEX "RatingScaleAnchor_dimensionId_value_key" ON "RatingScaleAnchor"("dimensionId", "value");
CREATE INDEX "RatingScaleAnchor_dimensionId_idx" ON "RatingScaleAnchor"("dimensionId");
CREATE INDEX "FlavorCategory_parentId_idx" ON "FlavorCategory"("parentId");
CREATE INDEX "Flavor_categoryId_idx" ON "Flavor"("categoryId");
CREATE INDEX "GuidedStep_phaseId_idx" ON "GuidedStep"("phaseId");
CREATE INDEX "Line_distilleryId_idx" ON "Line"("distilleryId");
CREATE INDEX "Bottle_lineId_idx" ON "Bottle"("lineId");
CREATE INDEX "Bottle_status_idx" ON "Bottle"("status");
CREATE INDEX "BottlePhoto_bottleId_idx" ON "BottlePhoto"("bottleId");
CREATE UNIQUE INDEX "Pour_bottleId_pourNumber_key" ON "Pour"("bottleId", "pourNumber");
CREATE INDEX "Pour_bottleId_idx" ON "Pour"("bottleId");
CREATE INDEX "Pour_pouredAt_idx" ON "Pour"("pouredAt");
CREATE UNIQUE INDEX "PourPhaseNote_pourId_phaseId_key" ON "PourPhaseNote"("pourId", "phaseId");
CREATE INDEX "PourPhaseNote_pourId_idx" ON "PourPhaseNote"("pourId");
CREATE UNIQUE INDEX "PourFlavor_pourId_phaseId_flavorId_key" ON "PourFlavor"("pourId", "phaseId", "flavorId");
CREATE INDEX "PourFlavor_pourId_idx" ON "PourFlavor"("pourId");
CREATE INDEX "PourFlavor_flavorId_idx" ON "PourFlavor"("flavorId");
CREATE UNIQUE INDEX "PourMouthfeel_pourId_mouthfeelId_key" ON "PourMouthfeel"("pourId", "mouthfeelId");
CREATE INDEX "PourMouthfeel_pourId_idx" ON "PourMouthfeel"("pourId");
CREATE UNIQUE INDEX "PourRating_pourId_dimensionId_key" ON "PourRating"("pourId", "dimensionId");
CREATE INDEX "PourRating_pourId_idx" ON "PourRating"("pourId");
CREATE INDEX "PourRating_dimensionId_idx" ON "PourRating"("dimensionId");

-- AddForeignKey
ALTER TABLE "RatingScaleAnchor" ADD CONSTRAINT "RatingScaleAnchor_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "RatingDimension"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlavorCategory" ADD CONSTRAINT "FlavorCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FlavorCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Flavor" ADD CONSTRAINT "Flavor_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FlavorCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuidedStep" ADD CONSTRAINT "GuidedStep_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "TastingPhase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Line" ADD CONSTRAINT "Line_distilleryId_fkey" FOREIGN KEY ("distilleryId") REFERENCES "Distillery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BottlePhoto" ADD CONSTRAINT "BottlePhoto_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pour" ADD CONSTRAINT "Pour_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Pour" ADD CONSTRAINT "Pour_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pour" ADD CONSTRAINT "Pour_glasswareId_fkey" FOREIGN KEY ("glasswareId") REFERENCES "Glassware"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PourPhaseNote" ADD CONSTRAINT "PourPhaseNote_pourId_fkey" FOREIGN KEY ("pourId") REFERENCES "Pour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PourPhaseNote" ADD CONSTRAINT "PourPhaseNote_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "TastingPhase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PourFlavor" ADD CONSTRAINT "PourFlavor_pourId_fkey" FOREIGN KEY ("pourId") REFERENCES "Pour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PourFlavor" ADD CONSTRAINT "PourFlavor_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "TastingPhase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PourFlavor" ADD CONSTRAINT "PourFlavor_flavorId_fkey" FOREIGN KEY ("flavorId") REFERENCES "Flavor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PourMouthfeel" ADD CONSTRAINT "PourMouthfeel_pourId_fkey" FOREIGN KEY ("pourId") REFERENCES "Pour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PourMouthfeel" ADD CONSTRAINT "PourMouthfeel_mouthfeelId_fkey" FOREIGN KEY ("mouthfeelId") REFERENCES "Mouthfeel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PourRating" ADD CONSTRAINT "PourRating_pourId_fkey" FOREIGN KEY ("pourId") REFERENCES "Pour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PourRating" ADD CONSTRAINT "PourRating_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "RatingDimension"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
