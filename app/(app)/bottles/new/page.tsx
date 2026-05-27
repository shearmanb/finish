import { PageHeader } from "@/components/app/page-header";
import { BottleForm } from "@/components/forms/bottle-form";
import { listProducts } from "@/lib/data/products";

export default async function NewBottlePage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  const products = await listProducts();
  return (
    <div>
      <PageHeader title="Add Bottle" backHref="/bottles" />
      <BottleForm
        defaultProductId={productId}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          distilleryName: p.distillery.name,
        }))}
      />
    </div>
  );
}
