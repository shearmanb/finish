import "server-only";
import { prisma } from "@/lib/db";
import type { BottleStatus } from "@prisma/client";

export async function listBottles(opts?: { status?: BottleStatus }) {
  return prisma.bottle.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: [{ createdAt: "desc" }],
    include: {
      line: { include: { distillery: true } },
      type: true,
      subType: true,
      photos: { orderBy: { sortIndex: "asc" }, take: 1 },
      _count: { select: { pours: true } },
    },
  });
}

export async function getBottle(id: string) {
  return prisma.bottle.findUnique({
    where: { id },
    include: {
      line: { include: { distillery: true } },
      ndpDistillery: true,
      store: true,
      type: true,
      subType: true,
      mashBill: true,
      finishType: true,
      photos: { orderBy: { sortIndex: "asc" } },
      pours: {
        orderBy: { pourNumber: "desc" },
        include: {
          glassware: true,
          location: true,
          ratings: { include: { dimension: true } },
        },
      },
    },
  });
}

export type BottleInput = {
  lineId: string;
  ndpDistilleryId: string | null;
  name: string | null;
  proof: number | null;
  singleBarrel: boolean;
  caskStrength: boolean;
  typeId: string | null;
  subTypeId: string | null;
  mashBillId: string | null;
  ageStatement: string | null;
  release: string | null;
  t8kePick: boolean;
  bottleNumber: string | null;
  barrelNumber: string | null;
  hasBarrelFinish: boolean;
  finishTypeId: string | null;
  producerNotes: string | null;
  websiteNotes: string | null;
  distilledDate: string | null; // yyyy-mm-dd
  status: BottleStatus;
  fillLevel: number | null;
  purchaseDate: string | null; // yyyy-mm-dd
  storeId: string | null;
  pricePaid: number | null;
  msrp: number | null;
  storageLocation: string | null;
  notes: string | null;
};
