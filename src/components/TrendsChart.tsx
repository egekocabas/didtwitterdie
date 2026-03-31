import ChartWrapper from "@/components/ChartWrapper";

const TRENDS_EMBED_URL =
  "https://trends.google.com/trends/embed/explore/TIMESERIES?" +
  "req=" +
  encodeURIComponent(
    JSON.stringify({
      comparisonItem: [
        { keyword: "twitter", geo: "", time: "2022-01-01 2026-12-31" },
        { keyword: "x.com", geo: "", time: "2022-01-01 2026-12-31" },
        { keyword: "x", geo: "", time: "2022-01-01 2026-12-31" },
      ],
      category: 0,
      property: "",
    })
  ) +
  "&tz=0";

export default function TrendsChart() {
  return (
    <ChartWrapper
      title="What people Google"
      description='Google search interest for "twitter", "x.com", and "x" over time. Values are relative (0–100), not absolute search volume.'
    >
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <iframe
          src={TRENDS_EMBED_URL}
          width="100%"
          height="460"
          frameBorder="0"
          loading="lazy"
          title="Google Trends: twitter vs x.com vs x"
          className="dark:[filter:invert(1)_hue-rotate(180deg)]"
        />
      </div>
      <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        Data source:{" "}
        <a
          href="https://trends.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600 dark:hover:text-gray-300"
        >
          Google Trends
        </a>
        . Official embed; Google terms apply.
      </p>
    </ChartWrapper>
  );
}
