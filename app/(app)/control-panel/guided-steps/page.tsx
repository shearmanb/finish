import { PageHeader } from "@/components/app/page-header";
import { GuidedStepManager } from "@/components/lookups/guided-step-manager";
import { getGuidedStepsAll, getActivePhases } from "@/lib/data/lookups";

export default async function GuidedStepsPage() {
  const [steps, phases] = await Promise.all([
    getGuidedStepsAll(),
    getActivePhases(),
  ]);
  return (
    <div>
      <PageHeader
        title="Guided Tasting Steps"
        subtitle="The script the guided tasting walks you through, in order."
        backHref="/control-panel"
      />
      <GuidedStepManager
        steps={steps.map((s) => ({
          id: s.id,
          title: s.title,
          instruction: s.instruction,
          capturesFlavors: s.capturesFlavors,
          isArchived: s.isArchived,
          phase: { id: s.phase.id, name: s.phase.name },
        }))}
        phases={phases.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
