import { PageHeader } from "@/components/app/page-header";
import { FlavorManager } from "@/components/lookups/flavor-manager";
import { getFlavorTreeAll } from "@/lib/data/lookups";

export default async function FlavorsPage() {
  const categories = await getFlavorTreeAll();
  return (
    <div>
      <PageHeader
        title="Flavors & Categories"
        subtitle="Your flavor wheel. Add categories, nest them, and tag flavors."
        backHref="/control-panel"
      />
      <FlavorManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          parentId: c.parentId,
          isArchived: c.isArchived,
          flavors: c.flavors.map((f) => ({
            id: f.id,
            name: f.name,
            isArchived: f.isArchived,
          })),
        }))}
      />
    </div>
  );
}
