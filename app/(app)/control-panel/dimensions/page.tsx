import { PageHeader } from "@/components/app/page-header";
import { DimensionManager } from "@/components/lookups/dimension-manager";
import { getDimensionsAll } from "@/lib/data/lookups";

export default async function DimensionsPage() {
  const dimensions = await getDimensionsAll();
  return (
    <div>
      <PageHeader
        title="Rating Dimensions"
        subtitle="Each dimension has its own scale. The Overall dimension carries the t8ke labels."
        backHref="/control-panel"
      />
      <DimensionManager
        dimensions={dimensions.map((d) => ({
          id: d.id,
          name: d.name,
          scaleType: d.scaleType,
          minValue: d.minValue,
          maxValue: d.maxValue,
          step: d.step,
          isArchived: d.isArchived,
          anchors: d.anchors.map((a) => ({
            value: a.value,
            label: a.label,
            description: a.description,
          })),
        }))}
      />
    </div>
  );
}
