"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Pencil, Archive, RotateCcw } from "lucide-react";
import {
  createGuidedStep,
  updateGuidedStep,
  setGuidedStepArchived,
  moveGuidedStep,
} from "@/lib/actions/lookups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Phase = { id: string; name: string };
type Step = {
  id: string;
  title: string;
  instruction: string;
  capturesFlavors: boolean;
  isArchived: boolean;
  phase: { id: string; name: string };
};

type FormValue = {
  phaseId: string;
  title: string;
  instruction: string;
  capturesFlavors: boolean;
};

function StepForm({
  value,
  phases,
  onChange,
  onSubmit,
  onCancel,
  pending,
  submitLabel,
}: {
  value: FormValue;
  phases: Phase[];
  onChange: (v: FormValue) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Title</Label>
        <Input
          className="mt-1"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="e.g. First nose, neat"
        />
      </div>
      <div>
        <Label>Phase</Label>
        <Select
          value={value.phaseId}
          onValueChange={(v) => onChange({ ...value, phaseId: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Pick a phase" />
          </SelectTrigger>
          <SelectContent>
            {phases.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Instruction</Label>
        <Textarea
          className="mt-1"
          value={value.instruction}
          onChange={(e) => onChange({ ...value, instruction: e.target.value })}
          placeholder="What should you do in this step?"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={value.capturesFlavors}
          onCheckedChange={(c) => onChange({ ...value, capturesFlavors: c })}
        />
        Capture flavor tags in this step
      </label>
      <div className="flex gap-2">
        <Button onClick={onSubmit} disabled={pending}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function GuidedStepManager({
  steps,
  phases,
}: {
  steps: Step[];
  phases: Phase[];
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const empty: FormValue = {
    phaseId: phases[0]?.id ?? "",
    title: "",
    instruction: "",
    capturesFlavors: true,
  };
  const [addForm, setAddForm] = React.useState<FormValue>(empty);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<FormValue>(empty);

  const active = steps.filter((s) => !s.isArchived);
  const archived = steps.filter((s) => s.isArchived);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {adding ? (
        <Card className="p-4">
          <StepForm
            value={addForm}
            phases={phases}
            onChange={setAddForm}
            pending={pending}
            submitLabel="Add step"
            onCancel={() => {
              setAdding(false);
              setAddForm(empty);
            }}
            onSubmit={() =>
              run(async () => {
                const res = await createGuidedStep(addForm);
                if (res.ok) {
                  setAdding(false);
                  setAddForm(empty);
                }
                return res;
              })
            }
          />
        </Card>
      ) : (
        <Button onClick={() => setAdding(true)}>+ New step</Button>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-2">
        {active.map((s, i) => (
          <Card key={s.id} className="p-4">
            {editingId === s.id ? (
              <StepForm
                value={editForm}
                phases={phases}
                onChange={setEditForm}
                pending={pending}
                submitLabel="Save"
                onCancel={() => setEditingId(null)}
                onSubmit={() =>
                  run(async () => {
                    const res = await updateGuidedStep(s.id, editForm);
                    if (res.ok) setEditingId(null);
                    return res;
                  })
                }
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="font-semibold">{s.title}</span>
                  <Badge variant="secondary">{s.phase.name}</Badge>
                  {s.capturesFlavors ? <Badge variant="muted">flavors</Badge> : null}
                  <div className="ml-auto flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending || i === 0}
                      onClick={() => run(() => moveGuidedStep(s.id, "up"))}
                      aria-label="Move up"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending || i === active.length - 1}
                      onClick={() => run(() => moveGuidedStep(s.id, "down"))}
                      aria-label="Move down"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(s.id);
                        setEditForm({
                          phaseId: s.phase.id,
                          title: s.title,
                          instruction: s.instruction,
                          capturesFlavors: s.capturesFlavors,
                        });
                      }}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => run(() => setGuidedStepArchived(s.id, true))}
                      aria-label="Archive"
                    >
                      <Archive className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-1.5 pl-8 text-sm text-muted-foreground">
                  {s.instruction}
                </p>
              </>
            )}
          </Card>
        ))}
      </div>

      {archived.length > 0 ? (
        <div>
          <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Archived
          </p>
          <div className="space-y-1.5">
            {archived.map((s) => (
              <Card key={s.id} className="flex items-center gap-2 p-2.5 opacity-60">
                <span className="flex-1 pl-1">{s.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => run(() => setGuidedStepArchived(s.id, false))}
                >
                  <RotateCcw className="size-4" /> Restore
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
