import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartWrapper from "@/components/ChartWrapper";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import RebrandAnnotation from "@/components/RebrandAnnotation";
import { filterByRange } from "@/utils/filterByRange";
import type { TrancoData, TimeRange } from "@/types";

interface MergedRankEntry {
  date: string;
  twitter?: number;
  x?: number;
}

function mergeByDate(twitter: { date: string; rank: number }[], x: { date: string; rank: number }[]): MergedRankEntry[] {
  const map = new Map<string, MergedRankEntry>();
  for (const d of twitter) map.set(d.date, { date: d.date, twitter: d.rank });
  for (const d of x) {
    const entry = map.get(d.date) ?? { date: d.date };
    entry.x = d.rank;
    map.set(d.date, entry);
  }
  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function isRebrandMonth(label: string | number | undefined): boolean {
  if (typeof label !== "string" && typeof label !== "number") {
    return false;
  }

  const date = new Date(String(label));

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getUTCFullYear() === 2023 && date.getUTCMonth() === 6;
}

interface RankingChartProps {
  data: TrancoData | null;
}

interface ChartHoverState {
  activeLabel?: string | number;
  isTooltipActive?: boolean;
}

export default function RankingChart({ data }: RankingChartProps) {
  const [range, setRange] = useState<TimeRange>("ALL");
  const [isRebrandLineHovered, setIsRebrandLineHovered] = useState(false);
  const [isRebrandPointHovered, setIsRebrandPointHovered] = useState(false);

  const twitterFiltered = filterByRange(data?.twitter ?? [], range);
  const xFiltered = filterByRange(data?.x ?? [], range);
  const merged = mergeByDate(twitterFiltered, xFiltered);
  const showRebrandNote = isRebrandLineHovered || isRebrandPointHovered;

  const latestTwitter = data?.twitter?.at(-1);
  const latestX = data?.x?.at(-1);

  return (
    <ChartWrapper
      title="Domain popularity over time"
      description={
        <>
          Aggregated domain ranking via the{" "}
          <a
            href="https://tranco-list.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Tranco List
          </a>
          .
        </>
      }
    >
      <p className="text-xs text-gray-400 dark:text-gray-500">Lower rank = more popular.</p>
      <TimeRangeSelector value={range} onChange={setRange} />

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={merged}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          onMouseMove={(state: ChartHoverState) => {
            setIsRebrandPointHovered(Boolean(state.isTooltipActive && isRebrandMonth(state.activeLabel)));
          }}
          onMouseLeave={() => {
            setIsRebrandPointHovered(false);
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: "var(--tick-color)" }}
            tickLine={false}
            minTickGap={60}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--tick-color)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `#${v}`}
            width={48}
          />
          <Tooltip
            formatter={(value, name) => [
              `#${value}`,
              name === "twitter" ? "twitter.com" : "x.com",
            ]}
            labelFormatter={(label) => formatDate(String(label))}
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
          <RebrandAnnotation onHoverChange={setIsRebrandLineHovered} />
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
      <p
        aria-live="polite"
        className={`min-h-4 text-xs transition-opacity ${
          showRebrandNote
            ? "visible text-red-500 opacity-100"
            : "invisible opacity-0"
        }`}
      >
        Jul 24, 2023: Twitter becomes X.
      </p>
      {latestTwitter && latestX && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          As of {formatDate(latestTwitter.date)}, twitter.com ranks{" "}
          <span className="font-semibold text-[#1DA1F2]">#{latestTwitter.rank}</span> globally
          vs x.com at <span className="font-semibold">#{latestX.rank}</span> in the Tranco list.
        </p>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Source: Tranco List. Citation: Le Pochat et al., NDSS 2019.
      </p>
    </ChartWrapper>
  );
}
