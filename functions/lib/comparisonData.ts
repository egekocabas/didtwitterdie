import type {
  RankEntry,
  PageviewEntry,
  RadarServicesData,
  UmbrellaData,
  MajesticData,
} from "@/types";

const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;

export interface DomainRanks {
  twitter: number | null;
  x: number | null;
}

export interface DomainRankHistory {
  twitter: RankEntry[];
  x: RankEntry[];
}

export interface ArchiveFetchResult {
  status: number;
  text?: string;
}

export interface ArchiveBackfillResult extends DomainRankHistory {
  lastSuccessfulDate: string | null;
  stoppedAt404: string | null;
}

export function mergeHistory(existing: RankEntry[], incoming: RankEntry[]): RankEntry[] {
  const map = new Map<string, number>();

  for (const entry of existing) {
    map.set(entry.date, entry.rank);
  }

  for (const entry of incoming) {
    if (entry.date && entry.rank != null) {
      map.set(entry.date, entry.rank);
    }
  }

  return Array.from(map.entries())
    .map(([date, rank]) => ({ date, rank }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function appendDomainRanks(
  existing: DomainRankHistory,
  date: string,
  ranks: DomainRanks,
): DomainRankHistory {
  return {
    twitter: ranks.twitter == null ? existing.twitter : mergeHistory(existing.twitter, [{ date, rank: ranks.twitter }]),
    x: ranks.x == null ? existing.x : mergeHistory(existing.x, [{ date, rank: ranks.x }]),
  };
}

export async function backfillArchiveRanks(
  existing: DomainRankHistory,
  dates: string[],
  fetchArchive: (date: string) => Promise<ArchiveFetchResult>,
  parseSnapshot: (text: string) => DomainRanks,
): Promise<ArchiveBackfillResult> {
  let history = existing;
  let lastSuccessfulDate: string | null = null;
  let stoppedAt404: string | null = null;

  for (const date of dates) {
    const result = await fetchArchive(date);

    if (result.status === 404) {
      stoppedAt404 = date;
      break;
    }

    if (result.status !== 200 || !result.text) {
      throw new Error(`Archive fetch failed for ${date}: ${result.status}`);
    }

    history = appendDomainRanks(history, date, parseSnapshot(result.text));
    lastSuccessfulDate = date;
  }

  return { ...history, lastSuccessfulDate, stoppedAt404 };
}

export function parseUmbrellaCsv(text: string): DomainRanks {
  const ranks: DomainRanks = { twitter: null, x: null };

  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    const [rankString, domain] = line.split(",", 2);

    if (domain === "twitter.com") {
      ranks.twitter = Number.parseInt(rankString ?? "", 10) || null;
    }

    if (domain === "x.com") {
      ranks.x = Number.parseInt(rankString ?? "", 10) || null;
    }

    if (ranks.twitter != null && ranks.x != null) {
      break;
    }
  }

  return ranks;
}

export function parseMajesticCsv(text: string): DomainRanks {
  const ranks: DomainRanks = { twitter: null, x: null };

  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    const fields = line.split(",");
    const rankString = fields[0];
    const domain = fields[2];
    const rank = Number.parseInt(rankString ?? "", 10);

    if (!Number.isFinite(rank)) continue;

    if (domain === "twitter.com") {
      ranks.twitter = rank;
    }

    if (domain === "x.com") {
      ranks.x = rank;
    }

    if (ranks.twitter != null && ranks.x != null) {
      break;
    }
  }

  return ranks;
}

export function extractRadarServiceSeries(
  payload: Record<string, unknown>,
  serviceName = "X / Twitter",
): RankEntry[] {
  const result = asRecord(payload.result);
  const series = asRecord(result?.serie_0);
  const timestamps = Array.isArray(series?.timestamps) ? series.timestamps : [];
  const values = Array.isArray(series?.[serviceName]) ? series[serviceName] : [];
  const points: RankEntry[] = [];

  for (let i = 0; i < Math.min(timestamps.length, values.length); i += 1) {
    const date = typeof timestamps[i] === "string" ? timestamps[i] : null;
    const rank = typeof values[i] === "number" ? values[i] : null;

    if (!date || rank == null || rank < 0) continue;
    points.push({ date, rank });
  }

  return points;
}

export function extractRadarServiceLatestRank(
  payload: Record<string, unknown>,
  serviceName = "X / Twitter",
): number | null {
  const result = asRecord(payload.result);
  const top = Array.isArray(result?.top_0) ? result.top_0 : [];

  for (const item of top) {
    const record = asRecord(item);
    if (record?.service === serviceName && typeof record.rank === "number") {
      return record.rank;
    }
  }

  return null;
}

export function extractRadarServiceAsOf(payload: Record<string, unknown>): string | null {
  const result = asRecord(payload.result);
  const meta = asRecord(result?.meta);
  const topMeta = asRecord(meta?.top_0);

  if (typeof topMeta?.date === "string") {
    return topMeta.date;
  }

  const dateRange = Array.isArray(meta?.dateRange) ? meta.dateRange : [];
  const lastRange = asRecord(dateRange.at(-1));
  const endTime = typeof lastRange?.endTime === "string" ? lastRange.endTime : null;

  return endTime ? endTime.slice(0, 10) : null;
}

export function parseWikipediaPageviews(payload: Record<string, unknown>): PageviewEntry[] {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const series: PageviewEntry[] = [];

  for (const item of items) {
    const record = asRecord(item);
    const timestamp = typeof record?.timestamp === "string" ? record.timestamp : null;
    const views = typeof record?.views === "number" ? record.views : null;

    if (!timestamp || views == null) continue;

    series.push({
      date: wikimediaTimestampToDate(timestamp),
      views,
    });
  }

  return series.sort((a, b) => a.date.localeCompare(b.date));
}

export async function extractSingleZipEntryText(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const endOfCentralDirectoryOffset = findEndOfCentralDirectory(view);

  if (endOfCentralDirectoryOffset < 0) {
    throw new Error("ZIP end of central directory not found");
  }

  const centralDirectoryOffset = view.getUint32(endOfCentralDirectoryOffset + 16, true);
  if (view.getUint32(centralDirectoryOffset, true) !== ZIP_CENTRAL_DIRECTORY_SIGNATURE) {
    throw new Error("ZIP central directory header not found");
  }

  const compressionMethod = view.getUint16(centralDirectoryOffset + 10, true);
  const compressedSize = view.getUint32(centralDirectoryOffset + 20, true);
  const localHeaderOffset = view.getUint32(centralDirectoryOffset + 42, true);

  if (view.getUint32(localHeaderOffset, true) !== ZIP_LOCAL_FILE_HEADER_SIGNATURE) {
    throw new Error("ZIP local file header not found");
  }

  const fileNameLength = view.getUint16(localHeaderOffset + 26, true);
  const extraFieldLength = view.getUint16(localHeaderOffset + 28, true);
  const start = localHeaderOffset + 30 + fileNameLength + extraFieldLength;
  const compressed = bytes.slice(start, start + compressedSize);

  const output =
    compressionMethod === 0
      ? compressed.buffer.slice(compressed.byteOffset, compressed.byteOffset + compressed.byteLength)
      : await decompressZipEntry(compressed);

  return new TextDecoder().decode(output);
}

export function toIsoDate(value: string | null | undefined, fallback = new Date()): string {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return fallback.toISOString().slice(0, 10);
}

export function getQuarterlyBackfillDates(
  startDate: string,
  currentDate: string,
): string[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${currentDate}T00:00:00Z`);
  const quarterEnds = [
    { month: 2, day: 31 },
    { month: 5, day: 30 },
    { month: 8, day: 30 },
    { month: 11, day: 31 },
  ];
  const dates: string[] = [];

  for (let year = start.getUTCFullYear(); year <= end.getUTCFullYear(); year += 1) {
    for (const quarterEnd of quarterEnds) {
      const date = new Date(Date.UTC(year, quarterEnd.month, quarterEnd.day));
      if (date < start || date >= end) continue;
      dates.push(date.toISOString().slice(0, 10));
    }
  }

  return dates.sort((a, b) => a.localeCompare(b));
}

export function createRadarServicesData(
  topPayload: Record<string, unknown>,
  timeseriesPayload: Record<string, unknown>,
): RadarServicesData {
  return {
    xTwitter: extractRadarServiceSeries(timeseriesPayload),
    latestRank: extractRadarServiceLatestRank(topPayload),
    category: "Social Media",
    asOf: extractRadarServiceAsOf(topPayload),
  };
}

export function createMajesticData(history: DomainRankHistory, asOf: string | null): MajesticData {
  return {
    twitter: history.twitter,
    x: history.x,
    asOf,
  };
}

export function createUmbrellaData(
  history: DomainRankHistory,
  asOf: string | null,
  historyLagDays?: number,
): UmbrellaData {
  return {
    twitter: history.twitter,
    x: history.x,
    asOf,
    ...(historyLagDays != null ? { historyLagDays } : {}),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function wikimediaTimestampToDate(timestamp: string): string {
  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6);
  const day = timestamp.slice(6, 8) || "01";
  return `${year}-${month}-${day}`;
}

function findEndOfCentralDirectory(view: DataView): number {
  const minimumOffset = Math.max(0, view.byteLength - 65557);

  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      return offset;
    }
  }

  return -1;
}

async function decompressZipEntry(compressed: Uint8Array): Promise<ArrayBuffer> {
  if (typeof DecompressionStream !== "function") {
    throw new Error("DecompressionStream is not available in this runtime");
  }

  const compressedBuffer = compressed.buffer.slice(
    compressed.byteOffset,
    compressed.byteOffset + compressed.byteLength,
  ) as ArrayBuffer;
  const stream = new Blob([compressedBuffer]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return await new Response(stream).arrayBuffer();
}
