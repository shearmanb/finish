-- Add NDP (non-distiller producer) source distillery reference to Bottle.
ALTER TABLE "Bottle" ADD COLUMN "ndpDistilleryId" TEXT;
CREATE INDEX "Bottle_ndpDistilleryId_idx" ON "Bottle"("ndpDistilleryId");
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_ndpDistilleryId_fkey"
    FOREIGN KEY ("ndpDistilleryId") REFERENCES "Distillery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
