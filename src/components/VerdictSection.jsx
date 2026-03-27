import ChartWrapper from "./ChartWrapper";

function computeVerdict(data) {
  const twitterRank = data?.radar?.twitter?.at(-1)?.rank ?? null;
  const xRank = data?.radar?.x?.at(-1)?.rank ?? null;

  if (twitterRank == null || xRank == null) return null;

  const twitterWins = twitterRank < xRank;

  // Percentage-alive: how much better twitter.com ranks vs x.com
  // If twitter=#8, x=#17 → twitter is ahead by 9 spots out of x's rank
  // Simple ratio: twitter rank as % of x rank (lower is better, so invert)
  const alivePercent = Math.round((1 - twitterRank / (twitterRank + xRank)) * 100);

  return { twitterRank, xRank, twitterWins, alivePercent };
}

export default function VerdictSection({ data }) {
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

  const { twitterRank, xRank, twitterWins, alivePercent } = verdict;

  return (
    <ChartWrapper
      title="The verdict"
      description="Based on the latest Cloudflare Radar DNS popularity data."
    >
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4">
        <p className="text-5xl font-bold">
          {twitterWins ? "🐦 Not dead yet." : "💀 X has won."}
        </p>
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Twitter is{" "}
          <span className="text-[#1DA1F2]">{alivePercent}% alive</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          twitter.com ranks{" "}
          <span className="font-semibold text-[#1DA1F2]">#{twitterRank}</span> vs x.com at{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">#{xRank}</span> in global
          DNS popularity today.{" "}
          {twitterWins
            ? "People still type twitter.com more than x.com."
            : "More people now type x.com than twitter.com."}
        </p>
      </div>
    </ChartWrapper>
  );
}
