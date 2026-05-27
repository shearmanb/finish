import "server-only";
import { prisma } from "@/lib/db";
import type { BottleStatus } from "@prisma/client";

export async function listBottles(opts?: { status?: BottleStatus }) {
  return prisma.bottle.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: [{ createdAt: "desc" }],
    include: {
      product: { include: { distillery: true } },
      photos: { orderBy: { sortIndex: "asc" }, take: 1 },
      _count: { select: { pours: true } },
    },
  });
}

export async function getBottle(id: string) {
  return prisma.bottle.findUnique({
    where: { id },
    include: {
      product: { include: { distillery: true } },
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
  productId: string;
  bottlingName: string | null;
  status: BottleStatus;
  fillLevel: number | null;
  purchaseDate: string | null; // yyyy-mm-dd
  store: string | null;
  pricePaid: number | null;
  msrp: number | null;
  storageLocation: string | null;
  notes: string | null;
};
