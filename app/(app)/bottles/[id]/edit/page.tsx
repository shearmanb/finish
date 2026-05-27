import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { BottleForm } from "@/components/forms/bottle-form";
import { getBottle } from "@/lib/data/bottles";
import { listProducts } from "@/lib/data/products";

export default async function EditBottlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bottle, products] = await Promise.all([getBottle(id), listProducts()]);
  if (!bottle) notFound();

  return (
    <div>
      <PageHeader title="Edit Bottle" backHref={`/bottles/${id}`} />
      <BottleForm
        bottleId={bottle.id}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          distilleryName: p.distillery.name,
        }))}
        initial={{
          productId: bottle.productId,
          bottlingName: bottle.bottlingName,
          status: bottle.status,
          fillLevel: bottle.fillLevel,
          purchaseDate: bottle.purchaseDate
            ? bottle.purchaseDate.toISOString().slice(0, 10)
            : null,
          store: bottle.store,
          pricePaid: bottle.pricePaid ? Number(bottle.pricePaid) : null,
          msrp: bottle.msrp ? Number(bottle.msrp) : null,
          storageLocation: bottle.storageLocation,
          notes: bottle.notes,
        }}
      />
    </div>
  );
}
