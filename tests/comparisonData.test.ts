import test from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import {
  appendDomainRanks,
  backfillArchiveRanks,
  createRadarServicesData,
  extractSingleZipEntryText,
  parseMajesticCsv,
  parseUmbrellaCsv,
} from "#functions/lib/comparisonData";
import { computeVerdict } from "#src/utils/verdict";
import type { ApiResponse } from "#src/types";

test("extracts exact Cisco Umbrella ranks from a ZIP payload", async () => {
  const csv = ["1,google.com", "555,twitter.com", "2886,x.com", "4000,netflix.com"].join("\n");
  const zip = createSingleEntryZip("top-1m.csv", csv);
  const zipBytes = Uint8Array.from(zip);
  const text = await extractSingleZipEntryText(zipBytes.buffer);
  const ranks = parseUmbrellaCsv(text);

  assert.deepEqual(ranks, { twitter: 555, x: 2886 });
});

test("extracts exact Majestic ranks from CSV rows", () => {
  const csv = [
    "GlobalRank,TldRank,Domain,TLD,RefSubNets,RefIPs",
    "5,5,twitter.com,com,379345,1529579",
    "19,14,x.com,com,183509,597692",
    "378,221,netflix.com,com,19442,55771",
  ].join("\n");

  assert.deepEqual(parseMajesticCsv(csv), { twitter: 5, x: 19 });
});

test("extracts the X / Twitter Radar services snapshot and series", () => {
  const topPayload = {
    result: {
      top_0: [
        { rank: 1, service: "Facebook" },
        { rank: 6, service: "X / Twitter" },
      ],
      meta: {
        top_0: {
          date: "2026-03-31",
          serviceCategory: "Social Media",
        },
      },
    },
  };
  const timeseriesPayload = {
    result: {
      serie_0: {
        timestamps: ["2026-03-29", "2026-03-30", "2026-03-31"],
        "X / Twitter": [6, 5, 6],
        Reddit: [7, 7, 7],
      },
    },
  };

  assert.deepEqual(createRadarServicesData(topPayload, timeseriesPayload), {
    xTwitter: [
      { date: "2026-03-29", rank: 6 },
      { date: "2026-03-30", rank: 5 },
      { date: "2026-03-31", rank: 6 },
    ],
    latestRank: 6,
    category: "Social Media",
    asOf: "2026-03-31",
  });
});

test("appendDomainRanks preserves existing history when a source has missing ranks", () => {
  const history = appendDomainRanks(
    {
      twitter: [{ date: "2026-03-30", rank: 555 }],
      x: [{ date: "2026-03-30", rank: 2886 }],
    },
    "2026-03-31",
    { twitter: null, x: 3000 },
  );

  assert.deepEqual(history, {
    twitter: [{ date: "2026-03-30", rank: 555 }],
    x: [
      { date: "2026-03-30", rank: 2886 },
      { date: "2026-03-31", rank: 3000 },
    ],
  });
});

test("archive backfill stops cleanly on Cisco 404s", async () => {
  const result = await backfillArchiveRanks(
    { twitter: [], x: [] },
    ["2025-12-31", "2026-03-31", "2026-06-30"],
    async (date) => {
      if (date === "2025-12-31") {
        return { status: 200, text: "532,twitter.com\n2415,x.com" };
      }

      return { status: 404 };
    },
    parseUmbrellaCsv,
  );

  assert.equal(result.lastSuccessfulDate, "2025-12-31");
  assert.equal(result.stoppedAt404, "2026-03-31");
  assert.deepEqual(result.twitter, [{ date: "2025-12-31", rank: 532 }]);
  assert.deepEqual(result.x, [{ date: "2025-12-31", rank: 2415 }]);
});

test("the legacy verdict still works when new API fields are null", () => {
  const payload: ApiResponse = {
    radar: {
      twitter: { bucket: "200" },
      x: { bucket: "500" },
    },
    trends: null,
    tranco: {
      twitter: [{ date: "2026-03-30", rank: 17 }],
      x: [{ date: "2026-03-30", rank: 60 }],
    },
    radarServices: null,
    umbrella: null,
    majestic: null,
    wikipedia: null,
    updated_at: 1774989934553,
  };

  assert.deepEqual(computeVerdict(payload), {
    twitterRank: 17,
    xRank: 60,
    twitterWins: true,
    alivePercent: 78,
    twitterBucket: "200",
    xBucket: "500",
  });
});

function createSingleEntryZip(fileName: string, content: string): Buffer {
  const fileNameBuffer = Buffer.from(fileName, "utf8");
  const contentBuffer = Buffer.from(content, "utf8");
  const compressed = deflateRawSync(contentBuffer);
  const localHeader = Buffer.alloc(30);
  const centralHeader = Buffer.alloc(46);
  const endOfCentralDirectory = Buffer.alloc(22);

  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(8, 8);
  localHeader.writeUInt32LE(0, 10);
  localHeader.writeUInt32LE(0, 14);
  localHeader.writeUInt32LE(compressed.length, 18);
  localHeader.writeUInt32LE(contentBuffer.length, 22);
  localHeader.writeUInt16LE(fileNameBuffer.length, 26);
  localHeader.writeUInt16LE(0, 28);

  const centralOffset = localHeader.length + fileNameBuffer.length + compressed.length;
  centralHeader.writeUInt32LE(0x02014b50, 0);
  centralHeader.writeUInt16LE(20, 4);
  centralHeader.writeUInt16LE(20, 6);
  centralHeader.writeUInt16LE(0, 8);
  centralHeader.writeUInt16LE(8, 10);
  centralHeader.writeUInt32LE(0, 12);
  centralHeader.writeUInt32LE(0, 16);
  centralHeader.writeUInt32LE(compressed.length, 20);
  centralHeader.writeUInt32LE(contentBuffer.length, 24);
  centralHeader.writeUInt16LE(fileNameBuffer.length, 28);
  centralHeader.writeUInt16LE(0, 30);
  centralHeader.writeUInt16LE(0, 32);
  centralHeader.writeUInt16LE(0, 34);
  centralHeader.writeUInt16LE(0, 36);
  centralHeader.writeUInt32LE(0, 38);
  centralHeader.writeUInt32LE(0, 42);

  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
  endOfCentralDirectory.writeUInt16LE(0, 4);
  endOfCentralDirectory.writeUInt16LE(0, 6);
  endOfCentralDirectory.writeUInt16LE(1, 8);
  endOfCentralDirectory.writeUInt16LE(1, 10);
  endOfCentralDirectory.writeUInt32LE(centralHeader.length + fileNameBuffer.length, 12);
  endOfCentralDirectory.writeUInt32LE(centralOffset, 16);
  endOfCentralDirectory.writeUInt16LE(0, 20);

  return Buffer.concat([
    localHeader,
    fileNameBuffer,
    compressed,
    centralHeader,
    fileNameBuffer,
    endOfCentralDirectory,
  ]);
}
