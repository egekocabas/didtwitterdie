import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MajesticData, RankEntry, UmbrellaData } from "@/types";
import { formatMonthYear, mergeRankSeriesByDate } from "@/utils/chartData";
import ChartWrapper from "@/components/ChartWrapper";

interface DirectRankSignalsSectionProps {
  umbrella: UmbrellaData | null;
  majestic: MajesticData | null;
}

interface RankSourceCardProps {
  title: string;
  description: string;
  attributionNote: string;
  data: {
    twitter: RankEntry[];
    x: RankEntry[];
    asOf: string | null;
    historyLagDays?: number;
  } | null;
  sourceHref: string;
  fallbackNote: string;
}

export default function DirectRankSignalsSection({
  umbrella,
  majestic,
}: DirectRankSignalsSectionProps) {
  if (!umbrella && !majestic) {
    return null;
  }

  return (
    <ChartWrapper
      title="Direct rank signals"
      description="These are standalone domain-level comparisons, shown separately from Tranco so you can see the raw signals that feed broader popularity rankings."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <RankSourceCard
          title="Cisco Umbrella"
          description="Daily DNS popularity across Cisco Umbrella's network, with best-effort quarterly archive backfill."
          attributionNote="Source: Cisco Umbrella Popularity List. The public list page reviewed did not state an explicit dataset license, so this site shows only narrow comparative excerpts."
          data={umbrella}
          sourceHref="https://umbrella-static.s3-us-west-1.amazonaws.com/index.html"
          fallbackNote="Historical backfill uses dated archive snapshots and the latest live list."
        />
        <RankSourceCard
          title="Majestic Million"
          description="Backlink and web-graph popularity from Majestic's free million-domain list."
          attributionNote="Source: Majestic Million. The dataset page advertises CC BY 3.0, while Majestic's broader site guidance still cautions against reseller-like reuse."
          data={majestic}
          sourceHref="https://majestic.com/reports/majestic-million"
          fallbackNote="This source is intentionally forward-only for now, so trend history will build from rollout."
        />
      </div>
    </ChartWrapper>
  );
}

function RankSourceCard({
  title,
  description,
  attributionNote,
  data,
  sourceHref,
  fallbackNote,
}: RankSourceCardProps) {
  if (!data || (data.twitter.length === 0 && data.x.length === 0)) {
    return null;
  }

  const latestTwitter = data.twitter.at(-1)?.rank ?? null;
  const latestX = data.x.at(-1)?.rank ?? null;
  const merged = mergeRankSeriesByDate(data.twitter, data.x);
  const hasTrend = merged.length > 1;

  return (
    <article className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 bg-white/60 dark:bg-gray-900/40">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <a
            href={sourceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Source
          </a>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">twitter.com</p>
          <p className="text-3xl font-bold text-[#1DA1F2]">{latestTwitter != null ? `#${latestTwitter}` : "-"}</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">x.com</p>
          <p className="text-3xl font-bold">{latestX != null ? `#${latestX}` : "-"}</p>
        </div>
      </div>

      {hasTrend ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatMonthYear}
              tick={{ fontSize: 11, fill: "var(--tick-color)" }}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--tick-color)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `#${value}`}
              width={52}
            />
            <Tooltip
              formatter={(value, name) => [
                `#${value}`,
                name === "twitter" ? "twitter.com" : "x.com",
              ]}
              labelFormatter={(label) => formatMonthYear(String(label))}
              contentStyle={{
                backgroundColor: "var(--tooltip-bg)",
                border: "1px solid var(--tooltip-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value: string) => (value === "twitter" ? "twitter.com" : "x.com")}
            />
            <Line
              type="monotone"
              dataKey="twitter"
              stroke="#1DA1F2"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="x"
              stroke="var(--chart-x-stroke)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
          {fallbackNote}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Lower rank = more popular. Snapshot date: {data.asOf ?? "unknown"}.
        {data.historyLagDays != null ? ` Archive lag: ${data.historyLagDays} day${data.historyLagDays === 1 ? "" : "s"}.` : ""}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{attributionNote}</p>
    </article>
  );
}
