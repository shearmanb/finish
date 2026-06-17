-- Link each owned bottle to its canonical identity in Cellar (the centralized
-- bottle catalog). Cellar ids are immutable integers; null means "not yet matched".
ALTER TABLE "Bottle" ADD COLUMN "cellarBottleId" INTEGER;
CREATE INDEX "Bottle_cellarBottleId_idx" ON "Bottle"("cellarBottleId");
