import ChartWrapper from "@/components/ChartWrapper";
import EcgLine from "@/components/EcgLine";
import type { ApiResponse } from "@/types";
import { computeVerdict } from "@/utils/verdict";

interface VerdictSectionProps {
  data: ApiResponse;
}

export default function VerdictSection({ data }: VerdictSectionProps) {
  const verdict = computeVerdict(data);

  if (!verdict) {
    return (
      <ChartWrapper title="The verdict">
        <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-8 text-center text-gray-400">
          Not enough data to compute a verdict.
        </div>
      </ChartWrapper>
    );
  }

  const { twitterWins } = verdict;

  return (
    <ChartWrapper title="The verdict">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4">
        <p className="text-5xl font-bold">
          {twitterWins ? "🐦 Not dead yet." : "💀 X has won."}
        </p>
        <EcgLine alive={twitterWins} />
      </div>
    </ChartWrapper>
  );
}
