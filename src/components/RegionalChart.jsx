import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartWrapper from "./ChartWrapper";

const COUNTRY_NAMES = {
  US: "United States",
  GB: "United Kingdom",
  JP: "Japan",
  BR: "Brazil",
  DE: "Germany",
  FR: "France",
  IN: "India",
  CA: "Canada",
  AU: "Australia",
  TR: "Turkey",
};

export default function RegionalChart({ data }) {
  const regional = data?.regional ?? {};

  const chartData = Object.entries(regional)
    .map(([code, val]) => ({
      country: COUNTRY_NAMES[code] ?? code,
      twitter: val.twitter_rank,
      x: val.x_rank,
    }))
    .sort((a, b) => a.twitter - b.twitter);

  return (
    <ChartWrapper
      title="Where does Twitter still rule?"
      description="Current DNS popularity rank per country — lower number means more popular. Data from Cloudflare Radar."
    >
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 96, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
          <XAxis
            type="number"
            reversed
            tick={{ fontSize: 11, fill: "var(--tick-color)" }}
            tickLine={false}
            tickFormatter={(v) => `#${v}`}
          />
          <YAxis
            type="category"
            dataKey="country"
            tick={{ fontSize: 12, fill: "var(--tick-color)" }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            formatter={(value, name) => [`#${value}`, name === "twitter" ? "twitter.com" : "x.com"]}
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
          <Bar dataKey="twitter" fill="#1DA1F2" radius={[0, 4, 4, 0]} maxBarSize={16} />
          <Bar dataKey="x" fill="var(--chart-x-stroke)" radius={[0, 4, 4, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
