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
import type { TimeRange, WikipediaData } from "@/types";
import { mergePageviewSeriesByDate, formatCompactNumber, formatMonthYear } from "@/utils/chartData";
import { filterByRange } from "@/utils/filterByRange";
import ChartWrapper from "@/components/ChartWrapper";
import TimeRangeSelector from "@/components/TimeRangeSelector";

interface WikipediaAttentionSectionProps {
  data: WikipediaData | null;
}

export default function WikipediaAttentionSection({ data }: WikipediaAttentionSectionProps) {
  const [range, setRange] = useState<TimeRange>("ALL");

  if (!data || (data.twitter.length === 0 && data.x.length === 0)) {
    return null;
  }

  const twitter = filterByRange(data.twitter, range);
  const x = filterByRange(data.x, range);
  const merged = mergePageviewSeriesByDate(twitter, x);
  const latestTwitter = data.twitter.at(-1);
  const latestX = data.x.at(-1);

  return (
    <ChartWrapper
      title="Brand attention on Wikipedia"
      description={
        <>
          Pageviews for the{" "}
          <a
            href="https://en.wikipedia.org/wiki/Twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Twitter
          </a>{" "}
          and{" "}
          <a
            href="https://en.wikipedia.org/wiki/X_(social_network)"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            X
          </a>{" "}
          Wikipedia articles.
        </>
      }
    >
      <div className="space-y-3">
        <TimeRangeSelector value={range} onChange={setRange} />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
              tickFormatter={(value: number) => formatCompactNumber(value)}
              width={60}
            />
            <Tooltip
              formatter={(value, name) => {
                const numericValue =
                  typeof value === "number"
                    ? value
                    : Array.isArray(value)
                      ? Number(value[0] ?? 0)
                      : Number(value ?? 0);
                const label = name === "twitter" ? "Twitter article" : "X article";
                return [numericValue.toLocaleString("en-US"), label];
              }}
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
        {latestTwitter && latestX && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Latest monthly article views: <span className="font-semibold text-[#1DA1F2]">{latestTwitter.views.toLocaleString("en-US")}</span> for Twitter vs{" "}
            <span className="font-semibold">{latestX.views.toLocaleString("en-US")}</span> for X. Current-month values may be partial.
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Source: Wikimedia Analytics API pageviews data (CC0). Read this as title-level attention,
          especially because the Twitter article path redirects to the X article.
        </p>
      </div>
    </ChartWrapper>
  );
}
