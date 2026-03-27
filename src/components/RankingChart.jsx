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
import ChartWrapper from "./ChartWrapper";
import TimeRangeSelector from "./TimeRangeSelector";
import RebrandAnnotation from "./RebrandAnnotation";
import { filterByRange } from "../utils/filterByRange";

function mergeByDate(twitter, x) {
  const map = new Map();
  for (const d of twitter) map.set(d.date, { date: d.date, twitter: d.rank });
  for (const d of x) {
    const entry = map.get(d.date) ?? { date: d.date };
    entry.x = d.rank;
    map.set(d.date, entry);
  }
  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function RankingChart({ data }) {
  const [range, setRange] = useState("ALL");

  const twitterFiltered = filterByRange(data?.twitter ?? [], range);
  const xFiltered = filterByRange(data?.x ?? [], range);
  const merged = mergeByDate(twitterFiltered, xFiltered);

  return (
    <ChartWrapper
      title="Domain popularity over time"
      description="Combined ranking from Cloudflare DNS, Cisco Umbrella, Chrome UX, Majestic, and Farsight passive DNS via the Tranco List. Lower rank = more popular."
    >
      <TimeRangeSelector value={range} onChange={setRange} />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: "var(--tick-color)" }}
            tickLine={false}
            minTickGap={60}
          />
          <YAxis
            reversed
            tick={{ fontSize: 11, fill: "var(--tick-color)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `#${v}`}
            width={36}
          />
          <Tooltip
            formatter={(value, name) => [`#${value}`, name]}
            labelFormatter={formatDate}
            contentStyle={{
              backgroundColor: "var(--tooltip-bg)",
              border: "1px solid var(--tooltip-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => (value === "twitter" ? "twitter.com" : "x.com")}
          />
          <RebrandAnnotation />
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
    </ChartWrapper>
  );
}
