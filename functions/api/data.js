const RADAR_BASE = "https://api.cloudflare.com/client/v4/radar/ranking";
const TRANCO_BASE = "https://tranco-list.eu/api/ranks/domain";

const REGIONAL_COUNTRIES = ["US", "GB", "JP", "BR", "DE", "FR", "IN", "CA", "AU", "TR"];

const RESPONSE_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=3600",
};

async function fetchRadarData(env) {
  const token = env.CLOUDFLARE_RADAR_TOKEN;
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch full time series from Sept 2022 to now
  const seriesUrl =
    `${RADAR_BASE}/timeseries_groups` +
    `?domains=twitter.com,x.com&dateStart=2022-09-26&dateEnd=${today()}&limit=500`;

  const [seriesRes, ...regionalRes] = await Promise.all([
    fetch(seriesUrl, { headers }),
    ...REGIONAL_COUNTRIES.map((loc) =>
      fetch(
        `${RADAR_BASE}/timeseries_groups?domains=twitter.com,x.com&location=${loc}&dateRange=1w`,
        { headers }
      )
    ),
  ]);

  if (!seriesRes.ok) {
    throw new Error(`Radar time series failed: ${seriesRes.status} ${seriesRes.statusText}`);
  }

  const seriesJson = await seriesRes.json();
  const serie = seriesJson?.result?.serie_0 ?? {};
  const timestamps = serie.timestamps ?? [];
  const twitterValues = serie["twitter.com"] ?? [];
  const xValues = serie["x.com"] ?? [];

  const twitterSeries = timestamps
    .map((ts, i) => ({ date: ts.slice(0, 10), rank: twitterValues[i] }))
    .filter((d) => d.rank != null);

  const xSeries = timestamps
    .map((ts, i) => ({ date: ts.slice(0, 10), rank: xValues[i] }))
    .filter((d) => d.rank != null);

  // Parse regional data
  const regional = {};
  for (let i = 0; i < REGIONAL_COUNTRIES.length; i++) {
    const country = REGIONAL_COUNTRIES[i];
    try {
      if (!regionalRes[i].ok) continue;
      const rJson = await regionalRes[i].json();
      const regionalSerie = rJson?.result?.serie_0 ?? {};
      const rTimestamps = regionalSerie.timestamps ?? [];
      const lastIdx = rTimestamps.length - 1;
      if (lastIdx < 0) continue;
      const twitterRank = (regionalSerie["twitter.com"] ?? [])[lastIdx];
      const xRank = (regionalSerie["x.com"] ?? [])[lastIdx];
      if (twitterRank != null && xRank != null) {
        regional[country] = { twitter_rank: twitterRank, x_rank: xRank };
      }
    } catch {
      // skip country on error
    }
  }

  return { twitter: twitterSeries, x: xSeries, regional };
}

async function fetchTrancoData(env) {
  // Fetch today's ranks for both domains in parallel
  const [twitterRes, xRes] = await Promise.all([
    fetch(`${TRANCO_BASE}/twitter.com`),
    fetch(`${TRANCO_BASE}/x.com`),
  ]);

  if (!twitterRes.ok || !xRes.ok) {
    throw new Error(`Tranco fetch failed: twitter=${twitterRes.status} x=${xRes.status}`);
  }

  const [twitterJson, xJson] = await Promise.all([twitterRes.json(), xRes.json()]);

  // Tranco returns { "domain": "twitter.com", "ranks": [{ "date": "...", "rank": N }, ...] }
  const twitterRanks = twitterJson?.ranks ?? [];
  const xRanks = xJson?.ranks ?? [];

  // Read existing accumulated history from KV
  const existing = (await env.CACHE.get("tranco_history", "json")) ?? { twitter: [], x: [] };

  const twitterHistory = mergeHistory(existing.twitter, twitterRanks);
  const xHistory = mergeHistory(existing.x, xRanks);

  // Persist updated history back to KV (no TTL — this is the accumulation store)
  await env.CACHE.put("tranco_history", JSON.stringify({ twitter: twitterHistory, x: xHistory }));

  return { twitter: twitterHistory, x: xHistory };
}

// Merge new entries into existing history, deduplicating by date
function mergeHistory(existing, incoming) {
  const map = new Map(existing.map((d) => [d.date, d.rank]));
  for (const entry of incoming) {
    const date = entry.date ?? entry.listed_date;
    const rank = entry.rank;
    if (date && rank != null) map.set(date, rank);
  }
  return Array.from(map.entries())
    .map(([date, rank]) => ({ date, rank }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: RESPONSE_HEADERS });
}

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "true";

  // 1. Try KV cache first (skip if ?refresh=true)
  if (!forceRefresh) {
    const cached = await env.CACHE.get("all_data", "json");
    if (cached) {
      return jsonResponse(cached);
    }
  }

  // 2. Cache miss — fetch live from all sources in parallel
  const errors = [];
  let radar = null;
  let tranco = null;

  const [radarResult, trancoResult] = await Promise.allSettled([
    fetchRadarData(env),
    fetchTrancoData(env),
  ]);

  if (radarResult.status === "fulfilled") {
    radar = radarResult.value;
  } else {
    errors.push(`radar: ${radarResult.reason?.message ?? "unknown error"}`);
  }

  if (trancoResult.status === "fulfilled") {
    tranco = trancoResult.value;
  } else {
    errors.push(`tranco: ${trancoResult.reason?.message ?? "unknown error"}`);
  }

  const data = {
    radar,
    trends: null,
    tranco,
    updated_at: Date.now(),
    ...(errors.length > 0 && { errors }),
  };

  // 3. Save to KV with 24hr TTL (only when we have at least some data)
  if (radar || tranco) {
    await env.CACHE.put("all_data", JSON.stringify(data), { expirationTtl: 86400 });
  }

  return jsonResponse(data);
}
