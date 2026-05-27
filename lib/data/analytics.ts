import "server-only";
import { prisma } from "@/lib/db";

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;

export async function getDashboard() {
  const overall = await prisma.ratingDimension.findFirst({
    where: { OR: [{ id: "dim_overall" }, { name: "Overall" }] },
  });

  const [statusGroups, bottleTotal, priceAgg, poursCount, productsCount] =
    await Promise.all([
      prisma.bottle.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.bottle.count(),
      prisma.bottle.aggregate({ _sum: { pricePaid: true } }),
      prisma.pour.count(),
      prisma.product.count(),
    ]);

  const statusCounts = { SEALED: 0, OPEN: 0, FINISHED: 0 } as Record<
    string,
    number
  >;
  for (const g of statusGroups) statusCounts[g.status] = g._count._all;

  const overallRatings = overall
    ? await prisma.pourRating.findMany({
        where: { dimensionId: overall.id },
        include: {
          pour: {
            include: {
              bottle: {
                include: { product: { include: { distillery: true } } },
              },
            },
          },
        },
      })
    : [];

  // Top pours by Overall
  const topPours = [...overallRatings]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((r) => ({
      pourId: r.pourId,
      value: r.value,
      productName: r.pour.bottle.product.name,
      distillery: r.pour.bottle.product.distillery.name,
      pourNumber: r.pour.pourNumber,
    }));

  // Average Overall by distillery
  const distMap = new Map<string, { sum: number; n: number }>();
  for (const r of overallRatings) {
    const key = r.pour.bottle.product.distillery.name;
    const cur = distMap.get(key) ?? { sum: 0, n: 0 };
    cur.sum += r.value;
    cur.n += 1;
    distMap.set(key, cur);
  }
  const byDistillery = Array.from(distMap.entries())
    .map(([name, { sum, n }]) => ({ name, avg: sum / n, n }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6);

  // Best value: Overall per dollar (bottles with a price and a rating)
  const valueMap = new Map<
    string,
    { name: string; bestOverall: number; price: number }
  >();
  for (const r of overallRatings) {
    const price = r.pour.bottle.pricePaid;
    if (!price) continue;
    const key = r.pour.bottle.id;
    const p = Number(price);
    const cur = valueMap.get(key);
    if (!cur || r.value > cur.bestOverall) {
      valueMap.set(key, {
        name: r.pour.bottle.product.name,
        bestOverall: r.value,
        price: p,
      });
    }
  }
  const bestValue = Array.from(valueMap.values())
    .map((v) => ({ ...v, ratio: v.bestOverall / v.price }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 5);

  // Flavor frequency
  const flavorGroup = await prisma.pourFlavor.groupBy({
    by: ["flavorId"],
    _count: { flavorId: true },
    orderBy: { _count: { flavorId: "desc" } },
    take: 12,
  });
  const flavorNames = await prisma.flavor.findMany({
    where: { id: { in: flavorGroup.map((f) => f.flavorId) } },
  });
  const nameById = new Map(flavorNames.map((f) => [f.id, f.name]));
  const topFlavors = flavorGroup.map((f) => ({
    name: nameById.get(f.flavorId) ?? "—",
    count: f._count.flavorId,
  }));
  const maxFlavor = topFlavors[0]?.count ?? 1;

  // Recent pours
  const recentRaw = await prisma.pour.findMany({
    orderBy: { pouredAt: "desc" },
    take: 6,
    include: {
      bottle: { include: { product: true } },
      ratings: { include: { dimension: true } },
    },
  });
  const recent = recentRaw.map((p) => ({
    id: p.id,
    productName: p.bottle.product.name,
    pourNumber: p.pourNumber,
    pouredAt: p.pouredAt,
    overall:
      p.ratings.find((r) => r.dimension.name === "Overall")?.value ?? null,
  }));

  return {
    counts: {
      bottles: bottleTotal,
      sealed: statusCounts.SEALED,
      open: statusCounts.OPEN,
      finished: statusCounts.FINISHED,
      pours: poursCount,
      expressions: productsCount,
    },
    collectionValue: priceAgg._sum.pricePaid
      ? Number(priceAgg._sum.pricePaid)
      : 0,
    topPours,
    byDistillery,
    bestValue,
    topFlavors,
    maxFlavor,
    recent,
  };
}
