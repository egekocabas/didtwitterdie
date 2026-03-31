import type { PageviewEntry, RankEntry } from "@/types";

export interface DualSeriesPoint {
  date: string;
  twitter?: number;
  x?: number;
}

type NumericDatedEntry<TKey extends "rank" | "views"> = {
  date: string;
} & Record<TKey, number>;

export function mergeRankSeriesByDate(twitter: RankEntry[], x: RankEntry[]): DualSeriesPoint[] {
  return mergeSeriesByDate(twitter, x, "rank");
}

export function mergePageviewSeriesByDate(twitter: PageviewEntry[], x: PageviewEntry[]): DualSeriesPoint[] {
  return mergeSeriesByDate(twitter, x, "views");
}

export function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function mergeSeriesByDate<TKey extends "rank" | "views">(
  twitter: NumericDatedEntry<TKey>[],
  x: NumericDatedEntry<TKey>[],
  key: TKey,
): DualSeriesPoint[] {
  const map = new Map<string, DualSeriesPoint>();

  for (const entry of twitter) {
    map.set(entry.date, { date: entry.date, twitter: entry[key] });
  }

  for (const entry of x) {
    const point = map.get(entry.date) ?? { date: entry.date };
    point.x = entry[key];
    map.set(entry.date, point);
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
