import type { Env } from "../types";
import type {
  RankEntry,
  RadarData,
  RadarServicesData,
  TrancoData,
  ApiResponse,
  UmbrellaData,
  MajesticData,
  WikipediaData,
} from "@/types";
import {
  appendDomainRanks,
  backfillArchiveRanks,
  createMajesticData,
  createRadarServicesData,
  createUmbrellaData,
  extractSingleZipEntryText,
  getQuarterlyBackfillDates,
  getNextMissingBackfillDate,
  getLatestBackfilledQuarterDate,
  mergeHistory,
  parseMajesticCsv,
  parseUmbrellaCsv,
  parseWikipediaPageviews,
  toIsoDate,
} from "../lib/comparisonData";

const RADAR_BASE = "https://api.cloudflare.com/client/v4/radar/ranking";
const TRANCO_BASE = "https://tranco-list.eu/api/ranks/domain";
const UMBRELLA_CURRENT_URL = "https://s3-us-west-1.amazonaws.com/umbrella-static/top-1m.csv.zip";
const UMBRELLA_ARCHIVE_URL = "https://s3-us-west-1.amazonaws.com/umbrella-static/top-1m-";
const MAJESTIC_URL = "https://downloads.majestic.com/majestic_million.csv";
const MAJESTIC_RANGE_BYTES = 2 * 1024 * 1024;
const WIKIMEDIA_BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article";
const WIKIMEDIA_RANGE_START = "2022010100";
const RADAR_SOCIAL_CATEGORY = "Social Media";
const RADAR_SERVICE_NAME = "X / Twitter";
const UMBRELLA_BACKFILL_START = "2024-03-31";
const UMBRELLA_BACKFILL_SOURCE = "umbrella";

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
  const headers = createRadarHeaders(env);

  const [twitterRes, xRes] = await Promise.all([
    fetch(`${RADAR_BASE}/domain/twitter.com`, { headers }),
    fetch(`${RADAR_BASE}/domain/x.com`, { headers }),
  ]);

  if (!twitterRes.ok || !xRes.ok) {
    throw new Error(`Radar domain fetch failed: twitter=${twitterRes.status} x=${xRes.status}`);
  }

  const [twitterJson, xJson] = await Promise.all([
    parseJsonObject(twitterRes),
    parseJsonObject(xRes),
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

async function fetchRadarServicesData(env: Env): Promise<RadarServicesData> {
  const headers = createRadarHeaders(env);
  const topUrl = new URL(`${RADAR_BASE}/internet_services/top`);
  topUrl.searchParams.set("serviceCategory", RADAR_SOCIAL_CATEGORY);
  topUrl.searchParams.set("limit", "10");

  const timeseriesUrl = new URL(`${RADAR_BASE}/internet_services/timeseries_groups`);
  timeseriesUrl.searchParams.set("serviceCategory", RADAR_SOCIAL_CATEGORY);
  timeseriesUrl.searchParams.set("limit", "10");
  timeseriesUrl.searchParams.set("dateRange", "90d");

  const [topRes, timeseriesRes] = await Promise.all([
    fetch(topUrl, { headers }),
    fetch(timeseriesUrl, { headers }),
  ]);

  if (!topRes.ok || !timeseriesRes.ok) {
    throw new Error(`Radar services fetch failed: top=${topRes.status} timeseries=${timeseriesRes.status}`);
  }

  const [topJson, timeseriesJson] = await Promise.all([
    parseJsonObject(topRes),
    parseJsonObject(timeseriesRes),
  ]);

  const data = createRadarServicesData(topJson, timeseriesJson);

  if (data.latestRank == null) {
    throw new Error(`${RADAR_SERVICE_NAME} missing from Radar services response`);
  }

  return data;
}

async function fetchTrancoData(env: Env): Promise<TrancoData> {
  const twitterRes = await fetch(`${TRANCO_BASE}/twitter.com`);
  if (!twitterRes.ok) {
    throw new Error(`Tranco fetch failed: twitter=${twitterRes.status}`);
  }
  const twitterJson = await parseJsonObject(twitterRes);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const xRes = await fetch(`${TRANCO_BASE}/x.com`);
  if (!xRes.ok) {
    throw new Error(`Tranco fetch failed: x=${xRes.status}`);
  }
  const xJson = await parseJsonObject(xRes);

  const twitterRanks = (twitterJson?.ranks as RankEntry[]) ?? [];
  const xRanks = (xJson?.ranks as RankEntry[]) ?? [];
  const existing = (await env.CACHE.get<TrancoData>("tranco_history", "json")) ?? TRANCO_SEED;
  const twitterHistory = mergeHistory(existing.twitter, twitterRanks);
  const xHistory = mergeHistory(existing.x, xRanks);

  await env.CACHE.put("tranco_history", JSON.stringify({ twitter: twitterHistory, x: xHistory }));

  return { twitter: twitterHistory, x: xHistory };
}

async function fetchUmbrellaData(env: Env): Promise<UmbrellaData> {
  const currentSnapshot = await fetchUmbrellaCurrentSnapshot();
  const existing = await getStoredUmbrellaData(env);
  const history = appendDomainRanks(
    {
      twitter: existing.twitter,
      x: existing.x,
    },
    currentSnapshot.asOf,
    currentSnapshot.ranks,
  );

  const data = createUmbrellaSnapshot(history, currentSnapshot.asOf);
  await env.CACHE.put("umbrella_history", JSON.stringify(data));
  return data;
}

async function fetchMajesticData(env: Env): Promise<MajesticData> {
  const { ranks, asOf } = await fetchMajesticCurrentRanks();
  const existing =
    (await env.CACHE.get<MajesticData>("majestic_history", "json")) ??
    createMajesticData({ twitter: [], x: [] }, null);

  const history = appendDomainRanks(
    {
      twitter: existing.twitter,
      x: existing.x,
    },
    asOf,
    ranks,
  );

  const data = createMajesticData(history, asOf);
  await env.CACHE.put("majestic_history", JSON.stringify(data));
  return data;
}

async function fetchWikipediaData(): Promise<WikipediaData> {
  const [twitterRes, xRes] = await Promise.all([
    fetch(buildWikipediaUrl("Twitter")),
    fetch(buildWikipediaUrl("X_(social_network)")),
  ]);

  if (!twitterRes.ok || !xRes.ok) {
    throw new Error(`Wikipedia fetch failed: twitter=${twitterRes.status} x=${xRes.status}`);
  }

  const [twitterJson, xJson] = await Promise.all([
    parseJsonObject(twitterRes),
    parseJsonObject(xRes),
  ]);

  const twitter = parseWikipediaPageviews(twitterJson);
  const x = parseWikipediaPageviews(xJson);
  const asOf = [twitter.at(-1)?.date, x.at(-1)?.date]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => a.localeCompare(b))
    .at(-1) ?? null;

  return { twitter, x, asOf };
}

async function backfillUmbrellaData(env: Env): Promise<{
  source: "umbrella";
  status: "backfilled" | "complete" | "waiting_for_archive";
  attemptedDate: string | null;
  backfilledDate: string | null;
  asOf: string | null;
  historyLagDays: number | null;
}> {
  const existing = await getStoredUmbrellaData(env);
  let history = {
    twitter: existing.twitter,
    x: existing.x,
  };
  let asOf = existing.asOf;
  let updatedCache = false;

  if (asOf == null) {
    const currentSnapshot = await fetchUmbrellaCurrentSnapshot();
    history = appendDomainRanks(history, currentSnapshot.asOf, currentSnapshot.ranks);
    asOf = currentSnapshot.asOf;
    updatedCache = true;
  }

  if (asOf == null) {
    throw new Error("Umbrella backfill requires a current snapshot date");
  }

  const quarterlyDates = getQuarterlyBackfillDates(UMBRELLA_BACKFILL_START, asOf);
  const nextBackfillDate = getNextMissingBackfillDate(quarterlyDates, history);

  if (nextBackfillDate == null) {
    const data = createUmbrellaSnapshot(history, asOf);
    await env.CACHE.put("umbrella_history", JSON.stringify(data));
    if (updatedCache) {
      await updateCachedUmbrellaSlice(env, data);
    }

    return {
      source: UMBRELLA_BACKFILL_SOURCE,
      status: "complete",
      attemptedDate: null,
      backfilledDate: null,
      asOf,
      historyLagDays: data.historyLagDays ?? null,
    };
  }

  const backfill = await backfillArchiveRanks(
    history,
    [nextBackfillDate],
    async (date) => {
      const archiveRes = await fetch(`${UMBRELLA_ARCHIVE_URL}${date}.csv.zip`);

      if (archiveRes.status === 404) {
        return { status: 404 };
      }

      if (!archiveRes.ok) {
        return { status: archiveRes.status };
      }

      return {
        status: archiveRes.status,
        text: await extractSingleZipEntryText(await archiveRes.arrayBuffer()),
      };
    },
    parseUmbrellaCsv,
  );

  history = {
    twitter: backfill.twitter,
    x: backfill.x,
  };

  const data = createUmbrellaSnapshot(history, asOf);
  await env.CACHE.put("umbrella_history", JSON.stringify(data));

  if (backfill.lastSuccessfulDate != null || updatedCache) {
    await updateCachedUmbrellaSlice(env, data);
  }

  return {
    source: UMBRELLA_BACKFILL_SOURCE,
    status: backfill.lastSuccessfulDate != null ? "backfilled" : "waiting_for_archive",
    attemptedDate: nextBackfillDate,
    backfilledDate: backfill.lastSuccessfulDate,
    asOf,
    historyLagDays: data.historyLagDays ?? null,
  };
}

function createRadarHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.CLOUDFLARE_RADAR_TOKEN}`,
  };
}

async function fetchUmbrellaCurrentSnapshot(): Promise<{
  ranks: {
    twitter: number | null;
    x: number | null;
  };
  asOf: string;
}> {
  const currentRes = await fetch(UMBRELLA_CURRENT_URL);
  if (!currentRes.ok) {
    throw new Error(`Umbrella fetch failed: current=${currentRes.status}`);
  }

  const currentText = await extractSingleZipEntryText(await currentRes.arrayBuffer());

  return {
    ranks: parseUmbrellaCsv(currentText),
    asOf: toIsoDate(currentRes.headers.get("last-modified")),
  };
}

async function getStoredUmbrellaData(env: Env): Promise<UmbrellaData> {
  return (
    (await env.CACHE.get<UmbrellaData>("umbrella_history", "json")) ??
    createUmbrellaData({ twitter: [], x: [] }, null)
  );
}

function createUmbrellaSnapshot(
  history: {
    twitter: RankEntry[];
    x: RankEntry[];
  },
  asOf: string,
): UmbrellaData {
  const quarterlyDates = getQuarterlyBackfillDates(UMBRELLA_BACKFILL_START, asOf);
  const latestBackfilledQuarterDate = getLatestBackfilledQuarterDate(quarterlyDates, history);
  const historyLagDays =
    latestBackfilledQuarterDate != null
      ? daysBetween(latestBackfilledQuarterDate, asOf)
      : undefined;

  return createUmbrellaData(history, asOf, historyLagDays);
}

async function updateCachedUmbrellaSlice(env: Env, umbrella: UmbrellaData): Promise<void> {
  const cached = await env.CACHE.get<ApiResponse>("all_data", "json");

  if (!cached) {
    return;
  }

  const { errors: _errors, ...cachedWithoutErrors } = cached;
  const nextErrors = cached.errors?.filter((error) => !error.startsWith("umbrella:"));
  const nextCached: ApiResponse = {
    ...cachedWithoutErrors,
    umbrella,
    updated_at: Date.now(),
    ...(nextErrors && nextErrors.length > 0 ? { errors: nextErrors } : {}),
  };

  await env.CACHE.put("all_data", JSON.stringify(nextCached), { expirationTtl: 86400 });
}

async function parseJsonObject(response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>;
}

async function fetchMajesticCurrentRanks(): Promise<{
  ranks: {
    twitter: number | null;
    x: number | null;
  };
  asOf: string;
}> {
  const partialRes = await fetch(MAJESTIC_URL, {
    headers: {
      Range: `bytes=0-${MAJESTIC_RANGE_BYTES - 1}`,
    },
  });

  if (!partialRes.ok) {
    throw new Error(`Majestic fetch failed: ${partialRes.status}`);
  }

  const partialText = await partialRes.text();
  const partialRanks = parseMajesticCsv(partialText);
  const partialAsOf = toIsoDate(partialRes.headers.get("last-modified"));

  if (partialRanks.twitter != null && partialRanks.x != null) {
    return { ranks: partialRanks, asOf: partialAsOf };
  }

  if (partialRes.status !== 206) {
    return { ranks: partialRanks, asOf: partialAsOf };
  }

  const fullRes = await fetch(MAJESTIC_URL);
  if (!fullRes.ok) {
    throw new Error(`Majestic fallback fetch failed: ${fullRes.status}`);
  }

  const fullText = await fullRes.text();
  return {
    ranks: parseMajesticCsv(fullText),
    asOf: toIsoDate(fullRes.headers.get("last-modified")),
  };
}

function buildWikipediaUrl(article: string): string {
  return `${WIKIMEDIA_BASE}/en.wikipedia.org/all-access/all-agents/${article}/monthly/${WIKIMEDIA_RANGE_START}/${currentMonthStartTimestamp()}`;
}

function currentMonthStartTimestamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}${month}0100`;
}

function daysBetween(fromDate: string, toDate: string): number {
  const start = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: RESPONSE_HEADERS });
}

async function settle<T>(promise: Promise<T>): Promise<PromiseSettledResult<T>> {
  try {
    return { status: "fulfilled", value: await promise };
  } catch (error) {
    return { status: "rejected", reason: error };
  }
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
  const backfillToken = url.searchParams.get("backfill");
  const backfillSource = url.searchParams.get("source");
  const forceRefresh = refreshToken !== null && refreshToken === env.REFRESH_SECRET;
  const forceUmbrellaBackfill =
    backfillToken !== null &&
    backfillToken === env.REFRESH_SECRET &&
    backfillSource === UMBRELLA_BACKFILL_SOURCE;

  if (!forceRefresh && !forceUmbrellaBackfill) {
    const cached = await env.CACHE.get<ApiResponse>("all_data", "json");
    if (cached) {
      return jsonResponse(cached);
    }
  }

  if (forceUmbrellaBackfill) {
    try {
      const result = await backfillUmbrellaData(env);
      return jsonResponse(result);
    } catch (error) {
      return jsonResponse(
        {
          source: UMBRELLA_BACKFILL_SOURCE,
          error: getErrorMessage(error),
        },
        500,
      );
    }
  }

  const errors: string[] = [];
  let radar: RadarData | null = null;
  let tranco: TrancoData | null = null;
  let radarServices: RadarServicesData | null = null;
  let umbrella: UmbrellaData | null = null;
  let majestic: MajesticData | null = null;
  let wikipedia: WikipediaData | null = null;

  const [radarResult, trancoResult, radarServicesResult, wikipediaResult] = await Promise.all([
    settle(fetchRadarData(env)),
    settle(fetchTrancoData(env)),
    settle(fetchRadarServicesData(env)),
    settle(fetchWikipediaData()),
  ]);

  const umbrellaResult = await settle(fetchUmbrellaData(env));
  const majesticResult = await settle(fetchMajesticData(env));

  if (radarResult.status === "fulfilled") {
    radar = radarResult.value;
  } else {
    errors.push(`radar: ${getErrorMessage(radarResult.reason)}`);
  }

  if (trancoResult.status === "fulfilled") {
    tranco = trancoResult.value;
  } else {
    errors.push(`tranco: ${getErrorMessage(trancoResult.reason)}`);
  }

  if (radarServicesResult.status === "fulfilled") {
    radarServices = radarServicesResult.value;
  } else {
    errors.push(`radarServices: ${getErrorMessage(radarServicesResult.reason)}`);
  }

  if (wikipediaResult.status === "fulfilled") {
    wikipedia = wikipediaResult.value;
  } else {
    errors.push(`wikipedia: ${getErrorMessage(wikipediaResult.reason)}`);
  }

  if (umbrellaResult.status === "fulfilled") {
    umbrella = umbrellaResult.value;
  } else {
    errors.push(`umbrella: ${getErrorMessage(umbrellaResult.reason)}`);
  }

  if (majesticResult.status === "fulfilled") {
    majestic = majesticResult.value;
  } else {
    errors.push(`majestic: ${getErrorMessage(majesticResult.reason)}`);
  }

  const data: ApiResponse = {
    radar,
    trends: null,
    tranco,
    radarServices,
    umbrella,
    majestic,
    wikipedia,
    updated_at: Date.now(),
    ...(errors.length > 0 ? { errors } : {}),
  };

  if (radar ?? tranco ?? radarServices ?? umbrella ?? majestic ?? wikipedia) {
    await env.CACHE.put("all_data", JSON.stringify(data), { expirationTtl: 86400 });
  }

  return jsonResponse(data);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}
