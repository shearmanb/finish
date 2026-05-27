import { PageHeader } from "@/components/app/page-header";
import { ProductForm } from "@/components/forms/product-form";
import { getActiveDistilleries } from "@/lib/data/lookups";

export default async function NewProductPage() {
  const distilleries = await getActiveDistilleries();
  return (
    <div>
      <PageHeader title="New Expression" backHref="/products" />
      <ProductForm
        distilleries={distilleries.map((d) => ({ id: d.id, name: d.name }))}
      />
    </div>
  );
}
