import ChartWrapper from "./ChartWrapper";

export default function TrendsChart() {
  return (
    <ChartWrapper
      title="What people Google"
      description='Search interest for "twitter" vs "x.com" over time.'
    >
      <div className="h-[300px] rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Coming soon — Google Trends integration
        </p>
      </div>
    </ChartWrapper>
  );
}
