const RANGES = ["1M", "6M", "1Y", "3Y", "ALL"];

export default function TimeRangeSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            value === range
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
