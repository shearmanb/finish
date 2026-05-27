import "server-only";
import { prisma } from "@/lib/db";

export async function listLines() {
  return prisma.line.findMany({
    orderBy: [{ name: "asc" }],
    include: {
      distillery: true,
      _count: { select: { bottles: true } },
    },
  });
}

export async function getLine(id: string) {
  return prisma.line.findUnique({
    where: { id },
    include: {
      distillery: true,
      bottles: {
        orderBy: { createdAt: "desc" },
        include: {
          photos: { orderBy: { sortIndex: "asc" }, take: 1 },
          _count: { select: { pours: true } },
        },
      },
    },
  });
}

export type LineInput = {
  name: string;
  distilleryId: string;
};
