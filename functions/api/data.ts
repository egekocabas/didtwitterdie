import type { Env } from "../types";
import type { RankEntry, RadarData, TrancoData, ApiResponse } from "../../src/types";

const RADAR_BASE = "https://api.cloudflare.com/client/v4/radar/ranking";
const TRANCO_BASE = "https://tranco-list.eu/api/ranks/domain";

const TRANCO_SEED: TrancoData = {
  twitter: [
    { date: "2022-09-01", rank: 8 },
    { date: "2023-01-01", rank: 9 },
    { date: "2023-04-01", rank: 7 },
    { date: "2023-07-24", rank: 7 },
    { date: "2023-10-01", rank: 10 },
    { date: "2024-01-01", rank: 11 },
    { date: "2024-03-01", rank: 12 },
    { date: "2024-04-01", rank: 12 },
    { date: "2024-06-01", rank: 13 },
    { date: "2024-07-01", rank: 13 },
    { date: "2024-10-01", rank: 13 },
    { date: "2025-01-01", rank: 12 },
    { date: "2025-04-01", rank: 14 },
    { date: "2025-07-01", rank: 13 },
    { date: "2025-10-01", rank: 14 },
    { date: "2026-01-01", rank: 15 },
    { date: "2026-03-01", rank: 16 },
  ],
  x: [
    { date: "2024-03-01", rank: 879 },
    { date: "2024-04-01", rank: 585 },
    { date: "2024-06-01", rank: 217 },
    { date: "2024-07-01", rank: 162 },
    { date: "2025-01-01", rank: 87 },
    { date: "2025-04-01", rank: 83 },
    { date: "2025-07-01", rank: 71 },
    { date: "2025-10-01", rank: 69 },
    { date: "2026-01-01", rank: 60 },
    { date: "2026-03-01", rank: 59 },
  ],
};

const RESPONSE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=3600",
};

async function fetchRadarData(env: Env): Promise<RadarData> {
  const token = env.CLOUDFLARE_RADAR_TOKEN;
  const headers = { Authorization: `Bearer ${token}` };

  const [twitterRes, xRes] = await Promise.all([
    fetch(`${RADAR_BASE}/domain/twitter.com`, { headers }),
    fetch(`${RADAR_BASE}/domain/x.com`, { headers }),
  ]);

  if (!twitterRes.ok || !xRes.ok) {
    throw new Error(`Radar domain fetch failed: twitter=${twitterRes.status} x=${xRes.status}`);
  }

  const [twitterJson, xJson] = await Promise.all([
    twitterRes.json() as Promise<Record<string, unknown>>,
    xRes.json() as Promise<Record<string, unknown>>,
  ]);

  const twitterResult = twitterJson?.result as Record<string, unknown> | undefined;
  const xResult = xJson?.result as Record<string, unknown> | undefined;
  const twitterDetails = twitterResult?.details_0 as Record<string, unknown> | undefined;
  const xDetails = xResult?.details_0 as Record<string, unknown> | undefined;

  return {
    twitter: { bucket: (twitterDetails?.bucket as string) ?? null },
    x: { bucket: (xDetails?.bucket as string) ?? null },
  };
}

async function fetchTrancoData(env: Env): Promise<TrancoData> {
  // Fetch sequentially to avoid 429 rate limiting
  const twitterRes = await fetch(`${TRANCO_BASE}/twitter.com`);
  if (!twitterRes.ok) {
    throw new Error(`Tranco fetch failed: twitter=${twitterRes.status}`);
  }
  const twitterJson = await twitterRes.json() as Record<string, unknown>;

  // Small delay between requests to respect rate limits
  await new Promise((r) => setTimeout(r, 500));

  const xRes = await fetch(`${TRANCO_BASE}/x.com`);
  if (!xRes.ok) {
    throw new Error(`Tranco fetch failed: x=${xRes.status}`);
  }
  const xJson = await xRes.json() as Record<string, unknown>;

  // Tranco returns { "domain": "twitter.com", "ranks": [{ "date": "...", "rank": N }, ...] }
  const twitterRanks = (twitterJson?.ranks as RankEntry[]) ?? [];
  const xRanks = (xJson?.ranks as RankEntry[]) ?? [];

  // Read existing accumulated history from KV, falling back to seed data
  const existing = (await env.CACHE.get<TrancoData>("tranco_history", "json")) ?? TRANCO_SEED;

  const twitterHistory = mergeHistory(existing.twitter, twitterRanks);
  const xHistory = mergeHistory(existing.x, xRanks);

  // Persist updated history back to KV (no TTL — this is the accumulation store)
  await env.CACHE.put("tranco_history", JSON.stringify({ twitter: twitterHistory, x: xHistory }));

  return { twitter: twitterHistory, x: xHistory };
}

// Merge new entries into existing history, deduplicating by date
function mergeHistory(existing: RankEntry[], incoming: RankEntry[]): RankEntry[] {
  const map = new Map<string, number>(existing.map((d) => [d.date, d.rank]));
  for (const entry of incoming) {
    const date = (entry.date as string | undefined) ?? (entry as unknown as Record<string, string>).listed_date;
    const rank = entry.rank;
    if (date && rank != null) map.set(date, rank);
  }
  return Array.from(map.entries())
    .map(([date, rank]) => ({ date, rank }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

function jsonResponse(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: RESPONSE_HEADERS });
}

export async function onRequestGet({
  env,
  request,
}: {
  env: Env;
  request: Request;
}): Promise<Response> {
  const url = new URL(request.url);
  const refreshToken = url.searchParams.get("refresh");
  const forceRefresh =
    refreshToken !== null &&
    refreshToken === env.REFRESH_SECRET;

  // 1. Try KV cache first (skip if ?refresh=true)
  if (!forceRefresh) {
    const cached = await env.CACHE.get<ApiResponse>("all_data", "json");
    if (cached) {
      return jsonResponse(cached);
    }
  }

  // 2. Cache miss — fetch live from all sources in parallel
  const errors: string[] = [];
  let radar: RadarData | null = null;
  let tranco: TrancoData | null = null;

  const [radarResult, trancoResult] = await Promise.allSettled([
    fetchRadarData(env),
    fetchTrancoData(env),
  ]);

  if (radarResult.status === "fulfilled") {
    radar = radarResult.value;
  } else {
    errors.push(`radar: ${(radarResult.reason as Error)?.message ?? "unknown error"}`);
  }

  if (trancoResult.status === "fulfilled") {
    tranco = trancoResult.value;
  } else {
    errors.push(`tranco: ${(trancoResult.reason as Error)?.message ?? "unknown error"}`);
  }

  const data: ApiResponse = {
    radar,
    trends: null,
    tranco,
    updated_at: Date.now(),
    ...(errors.length > 0 && { errors }),
  };

  // 3. Save to KV with 24hr TTL (only when we have at least some data)
  if (radar ?? tranco) {
    await env.CACHE.put("all_data", JSON.stringify(data), { expirationTtl: 86400 });
  }

  return jsonResponse(data);
}
