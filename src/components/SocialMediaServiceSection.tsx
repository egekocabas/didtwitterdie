import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RadarServicesData, TimeRange } from "@/types";
import { filterByRange } from "@/utils/filterByRange";
import { formatMonthYear } from "@/utils/chartData";
import ChartWrapper from "@/components/ChartWrapper";
import TimeRangeSelector from "@/components/TimeRangeSelector";

interface SocialMediaServiceSectionProps {
  data: RadarServicesData | null;
}

export default function SocialMediaServiceSection({ data }: SocialMediaServiceSectionProps) {
  const [range, setRange] = useState<TimeRange>("ALL");

  if (!data || data.xTwitter.length === 0) {
    return null;
  }

  const series = filterByRange(data.xTwitter, range);
  const latest = data.latestRank ?? data.xTwitter.at(-1)?.rank ?? null;

  return (
    <ChartWrapper
      title="X / Twitter social rank"
      description="Cloudflare Radar tracks X / Twitter as a broader social service, not just the twitter.com and x.com domains."
    >
      <div className="space-y-3">
        <p className="text-xs text-gray-400 dark:text-gray-500">Lower rank = more popular.</p>
        <TimeRangeSelector value={range} onChange={setRange} />
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatMonthYear}
              tick={{ fontSize: 11, fill: "var(--tick-color)" }}
              tickLine={false}
              minTickGap={60}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--tick-color)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `#${value}`}
              width={48}
            />
            <Tooltip
              formatter={(value) => [`#${value}`, "X / Twitter"]}
              labelFormatter={(label) => formatMonthYear(String(label))}
              contentStyle={{
                backgroundColor: "var(--tooltip-bg)",
                border: "1px solid var(--tooltip-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="rank"
              stroke="var(--chart-service-stroke)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {latest != null && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            As of {data.asOf ?? data.xTwitter.at(-1)?.date}, Cloudflare ranks X / Twitter{" "}
            <span className="font-semibold">#{latest}</span> among global social media services.
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Source:{" "}
          <a
            href="https://radar.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 dark:hover:text-gray-300"
          >
            Cloudflare Radar
          </a>
          . Radar API data is licensed under CC BY-NC 4.0.
        </p>
      </div>
    </ChartWrapper>
  );
}
