-- Add BottleType (hierarchical), MashBillType, FinishType lookups.
-- Reshape Bottle: replace text category/mashBill/finish with FKs,
-- add barrelNumber, distilledDate, websiteNotes, hasBarrelFinish.

-- ---------- New lookup: BottleType (2-level: type → sub-type) ----------
CREATE TABLE "BottleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BottleType_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BottleType_parentId_idx" ON "BottleType"("parentId");
ALTER TABLE "BottleType" ADD CONSTRAINT "BottleType_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "BottleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------- New lookup: MashBillType ----------
CREATE TABLE "MashBillType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MashBillType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MashBillType_name_key" ON "MashBillType"("name");

-- ---------- New lookup: FinishType ----------
CREATE TABLE "FinishType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FinishType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinishType_name_key" ON "FinishType"("name");

-- ---------- Reshape Bottle ----------
ALTER TABLE "Bottle" DROP COLUMN "category";
ALTER TABLE "Bottle" DROP COLUMN "mashBill";
ALTER TABLE "Bottle" DROP COLUMN "finish";

ALTER TABLE "Bottle" ADD COLUMN "typeId" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "subTypeId" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "mashBillId" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "hasBarrelFinish" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Bottle" ADD COLUMN "finishTypeId" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "barrelNumber" TEXT;
ALTER TABLE "Bottle" ADD COLUMN "distilledDate" TIMESTAMP(3);
ALTER TABLE "Bottle" ADD COLUMN "websiteNotes" TEXT;

CREATE INDEX "Bottle_typeId_idx" ON "Bottle"("typeId");
CREATE INDEX "Bottle_subTypeId_idx" ON "Bottle"("subTypeId");
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_typeId_fkey"
    FOREIGN KEY ("typeId") REFERENCES "BottleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_subTypeId_fkey"
    FOREIGN KEY ("subTypeId") REFERENCES "BottleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_mashBillId_fkey"
    FOREIGN KEY ("mashBillId") REFERENCES "MashBillType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_finishTypeId_fkey"
    FOREIGN KEY ("finishTypeId") REFERENCES "FinishType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
