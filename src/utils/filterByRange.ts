import type { TimeRange } from "@/types";

const CUTOFFS_DAYS: Record<TimeRange, number> = {
  "1M": 30,
  "6M": 180,
  "1Y": 365,
  "3Y": 365 * 3,
  "ALL": Infinity,
};

interface DatedEntry {
  date: string;
}

export function filterByRange<T extends DatedEntry>(data: T[], range: TimeRange): T[] {
  const days = CUTOFFS_DAYS[range] ?? Infinity;
  if (days === Infinity) return data;
  const cutoff = new Date(Date.now() - days * 86400000);
  return data.filter((d) => new Date(d.date) >= cutoff);
}
