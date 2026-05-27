import { PageHeader } from "@/components/app/page-header";
import { BottleTypeManager } from "@/components/lookups/bottle-type-manager";
import { getBottleTypesAll } from "@/lib/data/lookups";

export default async function BottleTypesPage() {
  const types = await getBottleTypesAll();
  return (
    <div>
      <PageHeader
        title="Bottle Types"
        subtitle="Types and sub-types for categorizing bottles."
        backHref="/control-panel"
      />
      <BottleTypeManager
        items={types.map((t) => ({
          id: t.id,
          name: t.name,
          parentId: t.parentId,
          isArchived: t.isArchived,
        }))}
      />
    </div>
  );
}
