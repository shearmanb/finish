import "server-only";
import { prisma } from "@/lib/db";

export async function listWishlist() {
  return prisma.wishlistItem.findMany({
    where: { isArchived: false },
    orderBy: [{ acquired: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    include: { product: { include: { distillery: true } } },
  });
}
