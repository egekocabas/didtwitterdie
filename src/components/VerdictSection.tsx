import ChartWrapper from "@/components/ChartWrapper";
import type { ApiResponse } from "@/types";
import { computeVerdict } from "@/utils/verdict";

interface VerdictSectionProps {
  data: ApiResponse;
}

export default function VerdictSection({ data }: VerdictSectionProps) {
  const verdict = computeVerdict(data);
  const serviceRank = data.radarServices?.latestRank ?? null;
  const umbrellaTwitterRank = data.umbrella?.twitter?.at(-1)?.rank ?? null;
  const umbrellaXRank = data.umbrella?.x?.at(-1)?.rank ?? null;
  const majesticTwitterRank = data.majestic?.twitter?.at(-1)?.rank ?? null;
  const majesticXRank = data.majestic?.x?.at(-1)?.rank ?? null;

  if (!verdict) {
    return (
      <ChartWrapper title="The verdict">
        <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-8 text-center text-gray-400">
          Not enough data to compute a verdict.
        </div>
      </ChartWrapper>
    );
  }

  const { twitterRank, xRank, twitterWins, twitterBucket, xBucket } = verdict;

  return (
    <ChartWrapper
      title="The verdict"
      description="Based on Tranco aggregated ranking and Cloudflare Radar DNS data, with the other sections shown separately as supporting context."
    >
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4">
        <p className="text-5xl font-bold">
          {twitterWins ? "🐦 Not dead yet." : "💀 X has won."}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          twitter.com ranks{" "}
          <span className="font-semibold text-[#1DA1F2]">#{twitterRank}</span> vs x.com at{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">#{xRank}</span> in global
          domain popularity.{" "}
          {twitterWins
            ? "People still use twitter.com more than x.com."
            : "More people now use x.com than twitter.com."}
        </p>
        {twitterBucket && xBucket && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Cloudflare Radar DNS: twitter.com is in the Top {twitterBucket}, x.com only Top {xBucket}
          </p>
        )}
        {serviceRank != null && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Cloudflare’s broader social-media ranking places X / Twitter at #{serviceRank}, which reflects the overall service rather than just the two domains.
          </p>
        )}
        {(umbrellaTwitterRank != null && umbrellaXRank != null) || (majesticTwitterRank != null && majesticXRank != null) ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supporting domain signals:
            {umbrellaTwitterRank != null && umbrellaXRank != null
              ? ` Cisco Umbrella shows twitter.com #${umbrellaTwitterRank} vs x.com #${umbrellaXRank}.`
              : ""}
            {majesticTwitterRank != null && majesticXRank != null
              ? ` Majestic shows twitter.com #${majesticTwitterRank} vs x.com #${majesticXRank}.`
              : ""}
          </p>
        ) : null}
        <p className="text-xs text-gray-400 dark:text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
          Ranks are based on aggregated DNS and web traffic signals from the Tranco List (Cloudflare
          DNS, Cisco Umbrella, Chrome UX, Majestic, Farsight). Note that twitter.com redirects to
          x.com, so traffic to both domains may partially overlap. This is a relative comparison, not
          a scientific metric. Google Trends and Wikipedia attention are narrative context only, and
          the additional direct-rank sources are shown as supporting evidence but are not yet weighted
          into the verdict formula.
        </p>
      </div>
    </ChartWrapper>
  );
}
