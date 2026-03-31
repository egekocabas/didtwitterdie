import type { ApiResponse } from "@/types";

export interface Verdict {
  twitterRank: number;
  xRank: number;
  twitterWins: boolean;
  alivePercent: number;
  twitterBucket: string | null;
  xBucket: string | null;
}

export function computeVerdict(data: ApiResponse): Verdict | null {
  const twitterRank = data?.tranco?.twitter?.at(-1)?.rank ?? null;
  const xRank = data?.tranco?.x?.at(-1)?.rank ?? null;

  if (twitterRank == null || xRank == null) return null;

  const twitterWins = twitterRank < xRank;
  const alivePercent = Math.round((1 - twitterRank / (twitterRank + xRank)) * 100);

  const twitterBucket = data?.radar?.twitter?.bucket ?? null;
  const xBucket = data?.radar?.x?.bucket ?? null;

  return { twitterRank, xRank, twitterWins, alivePercent, twitterBucket, xBucket };
}
