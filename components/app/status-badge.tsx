import type { BottleStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const MAP: Record<BottleStatus, { label: string; variant: "default" | "secondary" | "muted" | "success" }> = {
  SEALED: { label: "Sealed", variant: "muted" },
  OPEN: { label: "Open", variant: "success" },
  FINISHED: { label: "Finished", variant: "secondary" },
};

export function StatusBadge({ status }: { status: BottleStatus }) {
  const s = MAP[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
