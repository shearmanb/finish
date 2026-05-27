import "server-only";
import { prisma } from "@/lib/db";

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: [{ name: "asc" }],
    include: {
      distillery: true,
      _count: { select: { bottles: true } },
    },
  });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
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

export type ProductInput = {
  name: string;
  distilleryId: string;
  proof: number | null;
  caskStrength: boolean;
  category: string | null;
  mashBill: string | null;
  ageStatement: string | null;
};
