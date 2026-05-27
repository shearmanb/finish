"use client";

// Age values: "NAS" = Not Age Stated, numbers = years, "30+" = 30+ years.
// Stored as the string value in ageStatement field.

const AGES = [
  "NAS",
  "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "25", "27", "30", "30+",
];

function label(v: string) {
  if (v === "NAS") return "NAS";
  if (v === "30+") return "30+ yr";
  return `${v} yr`;
}

export function AgeStatementPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {AGES.map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => onChange(value === a ? "" : a)}
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
            value === a
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground"
          }`}
        >
          {label(a)}
        </button>
      ))}
    </div>
  );
}
