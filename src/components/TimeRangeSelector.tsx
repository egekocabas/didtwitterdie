import type { TimeRange } from "@/types";

const RANGES: TimeRange[] = ["1M", "6M", "1Y", "3Y", "ALL"];

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Time range">
      {RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          aria-pressed={value === range}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            value === range
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
