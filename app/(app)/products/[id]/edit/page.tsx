import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { ProductForm } from "@/components/forms/product-form";
import { getProduct } from "@/lib/data/products";
import { getActiveDistilleries } from "@/lib/data/lookups";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, distilleries] = await Promise.all([
    getProduct(id),
    getActiveDistilleries(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <PageHeader title="Edit Expression" backHref={`/products/${id}`} />
      <ProductForm
        productId={product.id}
        distilleries={distilleries.map((d) => ({ id: d.id, name: d.name }))}
        initial={{
          name: product.name,
          distilleryId: product.distilleryId,
          proof: product.proof,
          caskStrength: product.caskStrength,
          category: product.category,
          mashBill: product.mashBill,
          ageStatement: product.ageStatement,
        }}
      />
    </div>
  );
}
