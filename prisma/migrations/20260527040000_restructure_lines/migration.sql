-- Restructure: Product/Expression -> Line; move expression fields onto Bottle;
-- add Store lookup. Safe drops/alters: no production data exists yet.

-- ---------- New lookup: Store ----------
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");

-- ---------- New record: Line ----------
CREATE TABLE "Line" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distilleryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Line_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Line_distilleryId_idx" ON "Line"("distilleryId");
ALTER TABLE "Line" ADD CONSTRAINT "Line_distilleryId_fkey" FOREIGN KEY ("distilleryId") REFERENCES "Distillery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------- Drop FKs that reference Product ----------
ALTER TABLE "Bottle" DROP CONSTRAINT "Bottle_productId_fkey";
ALTER TABLE "WishlistItem" DROP CONSTRAINT "WishlistItem_productId_fkey";
DROP INDEX "Bottle_productId_idx";

-- ---------- Reshape Bottle ----------
ALTER TABLE "Bottle" DROP COLUMN "productId";
ALTER TABLE "Bottle" DROP COLUMN "bottlingName";
ALTER TABLE "Bottle" DROP COLUMN "store";

ALTER TABLE "Bottle" ADD COLUMN "lineId" TEXT NOT NULL;
ALTER TABLE "Bottle" ADD COLUMN "name" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "proof" DECIMAL(6,2);
ALTER TABLE "Bottle" ADD COLUMN "singleBarrel" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Bottle" ADD COLUMN "caskStrength" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Bottle" ADD COLUMN "category" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "mashBill" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "ageStatement" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "release" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "t8kePick" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Bottle" ADD COLUMN "bottleNumber" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "finish" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "producerNotes" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "storeId" TEXT;

CREATE INDEX "Bottle_lineId_idx" ON "Bottle"("lineId");
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------- Reshape WishlistItem ----------
ALTER TABLE "WishlistItem" DROP COLUMN "productId";
ALTER TABLE "WishlistItem" ADD COLUMN "lineId" TEXT;
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------- Drop Product ----------
DROP INDEX "Product_distilleryId_idx";
DROP TABLE "Product";
