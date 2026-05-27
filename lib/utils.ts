import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/** Trim a number to a clean display string (drops trailing zeros). */
export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return Number(value.toFixed(2)).toString();
}

export function proofToAbv(proof: number | null | undefined): number | null {
  if (proof === null || proof === undefined) return null;
  return Math.round((proof / 2) * 100) / 100;
}
