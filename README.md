# didtwitterdie.com

A single-page data dashboard that answers the question: **"Did Twitter die?"** by comparing the popularity of `twitter.com` vs `x.com` using multiple free data sources. Built to be viral, shareable, and visually compelling.

**Domain**: didtwitterdie.com

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Data Sources](#data-sources)
5. [Backend — Cloudflare Pages Functions + KV](#backend)
6. [Caching Strategy](#caching-strategy)
7. [Frontend — Single Page Scroll](#frontend)
8. [Page Sections & Charts](#page-sections--charts)
9. [Time Range Filtering](#time-range-filtering)
10. [API Response Shape](#api-response-shape)
11. [Project Structure](#project-structure)
12. [Design & Styling Guidelines](#design--styling-guidelines)
13. [Local Development](#local-development)
14. [Wrangler CLI Reference](#wrangler-cli-reference)
15. [Deployment](#deployment)
16. [Tasks Checklist](#tasks-checklist)

---

## Project Overview

When Twitter rebranded to X in July 2023, `twitter.com` started redirecting to `x.com`. But do people still type `twitter.com`? Do they still Google "twitter" instead of "x"? This site answers those questions with real data.

The core concept: compare `twitter.com` vs `x.com` across multiple metrics (DNS popularity, search interest, domain rankings) and present the data as a beautiful, scrollable, single-page story.

**Key date**: July 24, 2023 — the Twitter → X rebrand. This should appear as a vertical annotation line on all time-series charts.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **Vite + React** | Fast build, standard React (no Next.js to avoid Cloudflare bundle size issues) |
| Styling | **Tailwind CSS** | Responsive, mobile-first, dark mode support |
| Charts | **Recharts** | React-native, responsive, supports animations, mobile-friendly |
| Animations | **Framer Motion** | Scroll-triggered fade/slide-in for each chart section |
| Backend | **Cloudflare Pages Functions** | Serverless API routes (files in `functions/` folder) |
| Cache | **Cloudflare Workers KV** | Key-value store for cached API data |
| Cron | **Cloudflare Cron Triggers** | Scheduled worker to refresh cache daily |
| Hosting | **Cloudflare Pages** | Free tier, unlimited static asset bandwidth, custom domain support |

**Why NOT Next.js**: Next.js starter apps can exceed Cloudflare's free-tier bundle size limit (3MB compressed). Vite + React is lighter and the React code is identical.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           DATA SOURCES (external)                │
│                                                  │
│  Cloudflare Radar API              Tranco List   │
│  (free, API token)                 (free, no key)│
│                                                  │
│  [Google Trends — deferred to Phase 9]           │
└──────────┬─────────────────────────────┬─────────┘
           │                             │
           ▼                             ▼
┌─────────────────────────────────────────────────┐
│          CLOUDFLARE CRON WORKER (1x/day)         │
│                                                  │
│  Fetches from sources → merges data →            │
│  writes to KV cache                              │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              CLOUDFLARE KV CACHE                 │
│                                                  │
│  Key: "all_data"                                 │
│  Value: ~50-60KB JSON with full history          │
│  TTL: 24 hours                                   │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│         PAGES FUNCTION: GET /api/data            │
│                                                  │
│  1. Try KV cache → return if exists              │
│  2. Cache miss → fetch live → save to KV         │
│  3. Return JSON                                  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│         REACT FRONTEND (single page)             │
│                                                  │
│  One fetch("/api/data") on mount                 │
│  Each section reads its slice of the response    │
│  Time range filtering happens client-side        │
│  (no additional API calls)                       │
└─────────────────────────────────────────────────┘
```

---

## Data Sources

### 1. Cloudflare Radar API (DNS popularity bucket)

- **What it measures**: DNS query popularity bucket for domains on Cloudflare's 1.1.1.1 resolver
- **What it returns**: Ranking buckets (top 200, top 500, top 1000, etc.) — NOT exact rank numbers
- **Why it matters**: twitter.com being in a higher bucket (top 200) vs x.com (top 500) means more people still type twitter.com directly
- **API**: Free, requires Cloudflare API token (free account)
- **License**: CC BY-NC 4.0
- **Limitation**: The `timeseries_groups` endpoint only covers the top ~110 domains (CDN/infrastructure-heavy). twitter.com and x.com are not in this list. Only the `domain/{domain}` endpoint works, returning bucket data without exact ranks.

**Key endpoint**:

```
GET https://api.cloudflare.com/client/v4/radar/ranking/domain/{domain}
Headers: Authorization: Bearer {CLOUDFLARE_API_TOKEN}

Response: { "result": { "details_0": { "bucket": "200", "rank": null } } }
```

**Used for**: DNS bucket badge in the Hero section and as a supplementary signal in the Verdict.

### 2. Google Trends (search interest)

- **What it measures**: How often people search for "twitter" vs "x.com" vs "x social media" on Google
- **Why it matters**: Measures brand recognition — which name lives in people's heads
- **Historical data**: Goes back to 2004, but we only need from ~2022
- **Granularity**: Weekly for ranges under 5 years, monthly for longer
- **Data format**: Relative interest score 0-100 (not absolute numbers)

**Important implementation note**: There is no official Google Trends API. `pytrends` is a popular Python library but won't run in Cloudflare Workers (which is JavaScript). Options:

1. **Use `google-trends-api` npm package** — a JS library that scrapes Google Trends widget endpoints. Free, no API key needed, works in Node.js. May break if Google changes their internal endpoints.
2. **Use the Google Trends embed/widget URL** and parse the JSON response directly — this is what most libraries do under the hood. The URL pattern is `https://trends.google.com/trends/api/widgetdata/multiline?...`
3. **Pre-fetch with a GitHub Actions cron** — a Python script using `pytrends` runs on GitHub Actions schedule (free), writes results to a JSON file in R2 or a public gist, and the Cloudflare Worker reads that.

**Recommended approach for MVP**: Start WITHOUT Google Trends. Launch with Cloudflare Radar + Tranco first (both have clean, reliable, documented APIs). Add Google Trends as a second iteration — it's the most fragile data source since it relies on unofficial scraping. This simplifies the initial build significantly.

**When adding Google Trends later**, option 1 (`google-trends-api` npm package) is simplest. Option 3 (GitHub Actions) is most reliable long-term.

**Keywords to compare**: `"twitter"`, `"x.com"`, `"x social media"`

**Timeframe**: `"2022-01-01 {today}"` to cover the full before/after rebrand period

### 3. Tranco List (aggregated domain ranking)

- **What it measures**: Combined popularity rank from 5 independent sources (Cloudflare Radar DNS, Cisco Umbrella DNS, Chrome UX Report, Majestic backlinks, Farsight passive DNS)
- **Why it matters**: The "consensus vote" — if 5 different measurement methods all agree, that's a strong signal
- **API**: Free REST API + Python library
- **Historical data**: Past versions of lists can be downloaded; API gives current + 30 days back

**Key endpoints**:

```
# Get current rank for a domain
GET https://tranco-list.eu/api/ranks/domain/{domain}

# Get list by date
GET https://tranco-list.eu/api/lists/date/{YYYY-MM-DD}
```

**Python library** (for pre-fetching):
```python
from tranco import Tranco
t = Tranco(cache=True, cache_dir='.tranco')
latest = t.list()
latest.rank("twitter.com")  # returns integer rank
latest.rank("x.com")        # returns integer rank
```

**Important**: Tranco API only gives you current/recent ranks. You need to accumulate historical data yourself by fetching and storing the rank each day. Over weeks/months, you build up the time series. The cron worker should append each day's rank to the existing historical array in KV.

---

## Backend

### Cloudflare Pages Functions

Files in the `functions/` directory are automatically deployed as serverless API endpoints.

### Main API route: `functions/api/data.js`

```javascript
async function fetchRadarData(env) {
  const token = env.CLOUDFLARE_RADAR_TOKEN;
  const headers = { Authorization: `Bearer ${token}` };

  const [twitterRes, xRes] = await Promise.all([
    fetch(`${RADAR_BASE}/domain/twitter.com`, { headers }),
    fetch(`${RADAR_BASE}/domain/x.com`, { headers }),
  ]);

  const [twitterJson, xJson] = await Promise.all([twitterRes.json(), xRes.json()]);

  return {
    twitter: { bucket: twitterJson?.result?.details_0?.bucket ?? null },
    x: { bucket: xJson?.result?.details_0?.bucket ?? null },
  };
}

export async function onRequestGet({ env, request }) {
  // 1. Try KV cache first
  const cached = await env.CACHE.get("all_data", "json");
  if (cached) return jsonResponse(cached);

  // 2. Cache miss — fetch live from all sources
  const [radarResult, trancoResult] = await Promise.allSettled([
    fetchRadarData(env),
    fetchTrancoData(env),
  ]);

  const radar = radarResult.status === "fulfilled" ? radarResult.value : null;
  const tranco = trancoResult.status === "fulfilled" ? trancoResult.value : null;

  const data = { radar, trends: null, tranco, updated_at: Date.now() };

  // 3. Save to KV with 24hr TTL
  if (radar || tranco) {
    await env.CACHE.put("all_data", JSON.stringify(data), { expirationTtl: 86400 });
  }

  return jsonResponse(data);
}
```

**Note on CORS**: The `Access-Control-Allow-Origin: *` header is included so the frontend can call `/api/data` without CORS issues during local development. In production on the same domain this isn't strictly needed, but it doesn't hurt and avoids debugging headaches.

### Cron worker: scheduled data refresh

```toml
# wrangler.toml
[triggers]
crons = ["0 6 * * *"]   # runs daily at 06:00 UTC
```

**Important — Pages Functions cron setup**: Cloudflare Pages Functions don't natively support cron triggers the same way standalone Workers do. There are two approaches:

1. **Use a separate Cloudflare Worker for the cron job** — create a small standalone Worker (not a Pages Function) that runs on a schedule and writes to the same KV namespace. This is the cleanest approach.
2. **Use the API route's cache-miss fallback as the primary refresh mechanism** — set the KV TTL to 24 hours. When it expires, the next visitor's request triggers a live fetch and re-caches. This is simpler but means one visitor per day gets a slow response.

**Recommended for MVP**: Start with approach 2 (TTL-based expiration). The cache-miss fallback in your API route already handles this. Add a dedicated cron Worker later if you want guaranteed freshness.

The cron worker (when implemented):
1. Fetches fresh data from Cloudflare Radar and Tranco
2. For Radar: overwrites with full historical data (the API returns complete history)
3. For Tranco: merges/appends today's rank to existing historical array
4. Saves merged result to KV

### Environment variables and secrets

**What goes in `wrangler.toml` (safe to commit to GitHub):**

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

KV namespace IDs are public identifiers bound to your account — they are NOT secrets. Cloudflare's own docs confirm this. You can safely push `wrangler.toml` to a public GitHub repo.

**What goes in `.dev.vars` locally and Cloudflare dashboard in production (NEVER commit):**

```
# .dev.vars — secrets, do NOT commit to git
CLOUDFLARE_RADAR_TOKEN=your-cf-api-token
```

The API token is the only real secret. It goes in `.dev.vars` for local dev and in the Cloudflare dashboard (Pages project → Settings → Environment variables) for production.

---

## Caching Strategy

### Why cache?

The data from all sources only changes daily/weekly. Without caching, every visitor triggers 2 external API calls. With 1,000 visitors/day = 2,000 unnecessary calls.

### How it works

1. **Cron worker** runs 1x/day at 06:00 UTC, fetches all data, writes to KV
2. **API route** always tries KV first (cache hit = ~1ms response)
3. **Fallback**: if KV is empty (first deploy, cache expired), the API route fetches live, saves to KV, then returns
4. **Browser-side**: `Cache-Control: public, max-age=3600` header so browsers cache the response for 1 hour

### KV storage usage

| Key | Size | Writes/day | Reads/day |
|-----|------|-----------|-----------|
| `all_data` | ~50-60 KB | 1 (from cron) | 1 per visitor |

**Free tier limits**: 100,000 reads/day, 1,000 writes/day, 1 GB storage. We use a tiny fraction.

### Data accumulation for Tranco

Tranco only returns ~39 days of daily ranks. The backend seeds from pre-computed quarterly historical data (2022–2026) stored inline in `functions/api/data.js` as `TRANCO_SEED`. On each cache miss:
1. Read existing `tranco_history` from KV (or fall back to seed data if KV is empty)
2. Fetch latest ~39 days from Tranco API for both domains
3. Merge and deduplicate by date
4. Write the updated history back to KV (no TTL — this is the accumulation store)

---

## Frontend

### Single-Page Scroll Structure

The page tells a story as the user scrolls. Each section has a chart, a headline, and a short description. Sections animate in on scroll using Framer Motion.

### Single fetch, all data

```jsx
// App.jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("/api/data")
    .then(res => res.json())
    .then(d => { setData(d); setLoading(false); });
}, []);
```

Each section receives only its slice of data as props:

```jsx
<HeroSection radar={data.radar} tranco={data.tranco} />
<RankingChart data={data.tranco} />
{data.trends ? <TrendsChart data={data.trends} /> : <TrendsPlaceholder />}
<VerdictSection data={data} />
```

---

## Page Sections & Charts

### Section 1: Hero — "Did Twitter die?"

- **Data source**: Tranco (current rank) + Cloudflare Radar (DNS bucket)
- **API data used**: Latest rank from `data.tranco.twitter` / `data.tranco.x`, bucket from `data.radar.twitter.bucket` / `data.radar.x.bucket`
- **Display**: Two big rank numbers side by side, each with a small "DNS: Top N" badge below
- **Example**: twitter.com = #16 (DNS: Top 200) vs x.com = #59 (DNS: Top 500)
- **Story**: Immediately answers the question with the most reliable aggregated data

### Section 2: Domain popularity over time

- **Data source**: Tranco (primary — 3+ years of history via seed + daily accumulation)
- **API data used**: `data.tranco.twitter[]` and `data.tranco.x[]` — arrays of `{ date, rank }` objects
- **Chart type**: **Line chart** (Recharts `<LineChart>`) — two lines, one for each domain
- **X-axis**: Date
- **Y-axis**: Rank (INVERTED — lower number = more popular, so #1 is at the top)
- **Annotation**: Vertical dashed line at July 24, 2023 labeled "Rebrand to X"
- **Time range selector**: 1M / 6M / 1Y / 3Y / ALL buttons
- **Story**: "Domain popularity over time — the consensus of 5 data sources"
- **Note**: Historical data from 2022 is pre-seeded from verified Tranco list downloads. New daily data is appended on each cache miss.

### Section 3: Search interest — what people Google (DEFERRED — Phase 9)

> **MVP note**: This section is deferred to post-launch. For MVP, show a "Coming soon" placeholder. Google Trends has no official API, and unofficial scraping is fragile.

- **Data source**: Google Trends
- **API data used**: `data.trends.data[]` — array of `{ date, twitter, x_com, x_social }` where each value is 0-100
- **Chart type**: **Area chart** (Recharts `<AreaChart>`)
- **Keywords compared**: "twitter" (blue), "x.com" (amber/orange), "x social media" (gray)
- **Story**: "Do people still search 'twitter' or have they switched to 'x'?"

### Section 4: The verdict

- **Data source**: Tranco ranking + Cloudflare Radar DNS bucket
- **Display**: A summary verdict card, e.g., "Twitter is ___% alive"
- **Formula**: Based on latest Tranco ranks — if twitter.com rank is lower (better) than x.com, "Not dead yet." Plus a line showing Radar DNS bucket comparison.
- **Shareable**: Auto-generated OG image with the current verdict for social media sharing
- **Viral hook**: When someone shares the URL on Twitter/X, the preview card shows the current score

---

## Time Range Filtering

**Critical design decision**: Time range filtering is 100% client-side. No API calls for different ranges.

### How it works

1. Backend returns ALL historical data points in one response (~50KB JSON)
2. Frontend downloads it all in one `fetch("/api/data")` call
3. Each chart component has its own time range state
4. Clicking "1M", "6M", "1Y", "3Y", "ALL" filters the data array in JavaScript
5. React re-renders the chart with the filtered data — instant, no loading

### Filter logic

```javascript
const filterByRange = (data, range) => {
  const now = new Date();
  const cutoffs = {
    "1M": 30,
    "6M": 180,
    "1Y": 365,
    "3Y": 365 * 3,
    "ALL": Infinity
  };
  const days = cutoffs[range];
  if (days === Infinity) return data;
  const cutoff = new Date(now.getTime() - days * 86400000);
  return data.filter(d => new Date(d.date) >= cutoff);
};
```

### Time range button component

Reusable across all chart sections:

```jsx
const TimeRangeSelector = ({ value, onChange }) => (
  <div className="flex gap-2">
    {["1M", "6M", "1Y", "3Y", "ALL"].map(range => (
      <button
        key={range}
        onClick={() => onChange(range)}
        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
          value === range
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        {range}
      </button>
    ))}
  </div>
);
```

---

## API Response Shape

The single `/api/data` endpoint returns this JSON structure:

```json
{
  "radar": {
    "twitter": { "bucket": "200" },
    "x": { "bucket": "500" }
  },
  "trends": null,
  "tranco": {
    "twitter": [
      { "date": "2022-09-01", "rank": 8 },
      { "date": "2023-07-24", "rank": 7 },
      { "date": "2026-03-01", "rank": 16 }
    ],
    "x": [
      { "date": "2024-03-01", "rank": 879 },
      { "date": "2025-01-01", "rank": 87 },
      { "date": "2026-03-01", "rank": 59 }
    ]
  },
  "updated_at": 1711540800000
}
```

**Note**: `trends` is `null` for the MVP. When Google Trends is added in Phase 9, it will contain:
```json
{
  "keywords": ["twitter", "x.com", "x social media"],
  "data": [
    { "date": "2022-01-02", "twitter": 85, "x_com": 2, "x_social": 1 }
  ]
}
```
Frontend components should handle `data.trends === null` gracefully (show "Coming soon" placeholder).

---

## Project Structure

```
didtwitterdie/
├── src/
│   ├── App.jsx                    # Main app — single page scroll
│   ├── main.jsx                   # Vite entry point
│   ├── index.css                  # Tailwind imports + global styles
│   ├── hooks/
│   │   └── useData.js             # Custom hook: fetch + cache /api/data
│   ├── components/
│   │   ├── Layout.jsx             # Page wrapper, dark mode, font
│   │   ├── HeroSection.jsx        # Section 1: Tranco ranks + Radar bucket badges
│   │   ├── RankingChart.jsx       # Section 2: Tranco domain popularity chart
│   │   ├── TrendsChart.jsx        # Section 3: Trends area chart (placeholder for MVP)
│   │   ├── VerdictSection.jsx     # Section 4: the verdict
│   │   ├── TimeRangeSelector.jsx  # Reusable time range buttons
│   │   ├── ChartWrapper.jsx       # Framer Motion scroll animation wrapper
│   │   ├── RebrandAnnotation.jsx  # Vertical dashed line for July 24, 2023
│   │   ├── LoadingSkeleton.jsx    # Loading state skeletons
│   │   └── Footer.jsx             # Data source credits, last updated
│   └── utils/
│       ├── filterByRange.js       # Time range filtering logic
│       └── formatters.js          # Number formatting, date formatting
├── functions/
│   └── api/
│       └── data.js                # GET /api/data — main API route
├── public/
│   ├── favicon.ico
│   └── og-image.png               # Default OG image for social sharing
├── wrangler.toml                  # Cloudflare config (KV binding) — safe to commit
├── .dev.vars.example              # Template for secrets — commit this
├── .dev.vars                      # Actual secrets — DO NOT commit
├── .gitignore
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
├── index.html                     # Vite HTML entry (includes OG meta tags)
└── README.md                      # This file
```

---

## Design & Styling Guidelines

### Overall aesthetic

- Clean, minimal, data-first
- Dark mode support (Tailwind `dark:` classes)
- Mobile-first responsive design
- Each section should be screenshot-worthy for social sharing

### Color scheme

- **twitter.com line/area**: Blue (#1DA1F2 — the original Twitter blue)
- **x.com line/area**: Dark/black (#000000 or dark gray — the X brand color)
- **Background**: White (light mode), near-black (dark mode)
- **Text**: Standard gray scale
- **Rebrand annotation line**: Red dashed line with label

### Typography

- Clean sans-serif (Inter or system font stack)
- Large bold headlines per section
- Small muted descriptions below headlines

### Charts (Recharts)

- Smooth curves (`type="monotone"` on Line/Area components)
- Tooltips showing exact values on hover
- Responsive: `<ResponsiveContainer width="100%" height={300}>`
- Y-axis for rank charts should be INVERTED (lower rank = higher position on chart)
- Grid lines: subtle, light
- Legend: inline with the chart, not separate

### Scroll animations (Framer Motion)

- Each section fades + slides up on scroll into view
- Use `whileInView` with `viewport={{ once: true }}`
- Subtle, not flashy — `opacity: 0 → 1`, `y: 30 → 0`
- Stagger chart elements slightly for a polished feel

### Mobile

- Single column layout
- Charts resize to full width
- Time range buttons wrap or become scrollable
- Touch-friendly tap targets
- Hero numbers stack vertically on small screens

---

## Local Development

Local development uses **Wrangler** (Cloudflare's CLI) which simulates the entire Cloudflare platform on your machine via **Miniflare**. Your code is identical between local and production — no code changes needed.

### What Wrangler simulates locally

| Component | Production | Local dev |
|-----------|-----------|-----------|
| Static files | Cloudflare CDN | Local file server |
| Pages Functions | Cloudflare Workers | Miniflare (local) |
| KV store | Global KV network | Local SQLite file in `.wrangler/state/` |
| Env variables | CF dashboard | `.dev.vars` file |
| Cron triggers | Runs on schedule | Trigger manually via curl |

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:full": "npm run build && wrangler pages dev dist",
    "build": "vite build",
    "preview": "wrangler pages dev dist",
    "deploy": "wrangler pages deploy dist"
  }
}
```

**`npm run dev`** — Vite-only dev server at `http://localhost:5173`. Hot reload, fast refresh. The `/api/data` endpoint does not exist, so `useData` falls back to mock data automatically. Use this for UI work.

**`npm run dev:full`** — Builds Vite first, then starts Wrangler Pages dev server at `http://localhost:8788`. Simulates the full Cloudflare environment: Pages Functions at `/api/*`, local KV store, reads secrets from `.dev.vars`. Use this for testing the API and KV caching.

> **Note**: `wrangler pages dev -- vite` (the old proxy-command approach) is deprecated in Wrangler 4.78. The `command` positional is no longer supported. The correct approach is to build first, then serve `dist`.

### Local secrets and environment variables

Create a `.dev.vars` file in the project root (DO NOT commit to git):

```
CLOUDFLARE_RADAR_TOKEN=your-api-token-here
```

These are accessed in your function code via `env.CLOUDFLARE_RADAR_TOKEN` — the same code that reads from the Cloudflare dashboard in production.

### .gitignore additions

```
node_modules/
dist/
.dev.vars
.wrangler/
*.local
.DS_Store
```

### Local KV behavior

- KV starts empty on first run
- Your API route's cache-miss fallback handles this: first request fetches live from APIs, saves to local KV, returns data
- Every subsequent request reads from local KV (fast)
- Local KV data persists between dev server restarts (stored in `.wrangler/state/`)
- Delete `.wrangler/state/` to reset local KV to empty

### Seeding local KV with test data

Option A — Let the API route auto-fill on first request (recommended)

Option B — Manually seed via CLI:
```bash
npx wrangler kv key put --binding=CACHE --local "all_data" '{"radar":...}'
```

Option C — Use mock data during early frontend development:
```javascript
// In functions/api/data.js, temporarily return mock data
const MOCK_DATA = { radar: {...}, trends: {...}, tranco: {...} }
export async function onRequestGet() {
  return Response.json(MOCK_DATA)
}
```

Option C is recommended when building the frontend first — create a mock JSON file matching the expected API response shape so charts render without needing real API keys.

### Testing the cron locally

Cron triggers don't run on a schedule locally. Trigger manually:

```bash
curl "http://localhost:8788/__scheduled?cron=0+6+*+*+*"
```

Or just rely on the API route's cache-miss fallback — it does the same fetching logic.

### Daily development workflow

```bash
# Frontend-only dev (fast hot reload, mock data fallback)
npm run dev            # http://localhost:5173

# Full-stack dev (real API + KV, no hot reload)
npm run dev:full       # http://localhost:8788

# Before deploying:
npm run build          # builds Vite to dist/
npm run preview        # tests built version locally with wrangler
npm run deploy         # deploys to Cloudflare Pages
```

---

## Wrangler CLI Reference

Wrangler is Cloudflare's CLI tool. It handles local development, KV management, and deployment.

### Installation

```bash
npm install -D wrangler
```

Wrangler is installed as a dev dependency in the project (not globally). All commands use `npx wrangler` or the npm scripts.

### Creating a KV namespace

```bash
# Create the namespace (run once)
npx wrangler kv namespace create CACHE

# Output:
# ✅ Created namespace "didtwitterdie-CACHE" with ID "abc123..."
#
# Add the following to your wrangler.toml:
# [[kv_namespaces]]
# binding = "CACHE"
# id = "abc123..."
```

Copy the `id` value into your `wrangler.toml`. This only needs to be done once.

### Common wrangler commands

```bash
# Start local dev server (build first, then serve with Wrangler)
npm run build && npx wrangler pages dev dist

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist

# Check what's in your local KV
npx wrangler kv key list --binding=CACHE --local

# Read a specific key from local KV
npx wrangler kv key get --binding=CACHE --local "all_data"

# Write to local KV (for testing)
npx wrangler kv key put --binding=CACHE --local "all_data" '{"test": true}'

# Delete a key from local KV
npx wrangler kv key delete --binding=CACHE --local "all_data"

# Read from production KV (requires login)
npx wrangler kv key get --binding=CACHE --remote "all_data"

# Login to Cloudflare (needed for deploy and remote KV access)
npx wrangler login

# Check your Cloudflare account info
npx wrangler whoami
```

### Creating a Cloudflare API token for Radar

The Cloudflare Radar API requires an API token (different from your login credentials).

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Custom token" template
4. Set permissions: `Account` → `Account Analytics` → `Read`
5. (Optional) Add `Zone` → `Analytics` → `Read` if needed
6. Click "Continue to summary" → "Create Token"
7. Copy the token — you won't see it again
8. Add it to `.dev.vars` for local dev and to the Cloudflare dashboard for production

**Alternatively**, for Radar specifically, you can use a more permissive token. The Radar API docs say any valid API token works for reading public Radar data.

### File-based routing for Pages Functions

Cloudflare Pages uses the file system to define API routes:

```
functions/
└── api/
    └── data.js          → GET/POST /api/data
    └── health.js        → GET /api/health
    └── [...catchall].js → catches all other /api/* routes
```

Each file exports handler functions named by HTTP method:
- `onRequestGet` → handles GET requests
- `onRequestPost` → handles POST requests
- `onRequest` → handles all methods

The function receives a context object:
```javascript
export async function onRequestGet(context) {
  // context.env    — environment variables and bindings (KV, etc.)
  // context.params — URL parameters
  // context.request — the incoming Request object
  const data = await context.env.CACHE.get("key", "json");
  return new Response(JSON.stringify(data));
}
```

### Attribution requirement

Cloudflare Radar data is licensed under CC BY-NC 4.0. You must include attribution somewhere on the site (the footer is fine). Example: "DNS popularity data from Cloudflare Radar" with a link to https://radar.cloudflare.com.

### Complete .gitignore

```
node_modules/
dist/
.dev.vars
.wrangler/
*.local
.DS_Store
```

### .dev.vars.example

Create this file so contributors know what env vars are needed:

```
# Copy this to .dev.vars and fill in your values
# DO NOT commit .dev.vars to git

CLOUDFLARE_RADAR_TOKEN=your-cloudflare-api-token-here
```

---

## Deployment

### Cloudflare Pages setup

1. Create a Cloudflare account (free)
2. Go to Workers & Pages → Create → Connect to Git
3. Connect your GitHub repo
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Framework preset: Vite
5. Add custom domain: `didtwitterdie.com`
6. Set up KV namespace:
   - Go to Workers & Pages → KV → Create namespace (name: `DIDTWITTERDIE_CACHE`)
   - Bind it in wrangler.toml

### Environment variables to set

In Cloudflare dashboard → Pages project → Settings → Environment variables:

- `CLOUDFLARE_RADAR_TOKEN` — your Cloudflare API token (create at dash.cloudflare.com/profile/api-tokens)

**Note**: `wrangler.toml` is safe to commit to GitHub. KV namespace IDs are public identifiers, not secrets. Only API tokens (in `.dev.vars` and the dashboard) are secrets.

### wrangler.toml

```toml
name = "didtwitterdie"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

[[kv_namespaces]]
binding = "CACHE"
id = "<your-kv-namespace-id>"

# Uncomment if using a standalone cron Worker (Phase 9):
# [triggers]
# crons = ["0 6 * * *"]
```

**Key fields explained**:
- `pages_build_output_dir`: tells Wrangler where Vite outputs the built files
- `compatibility_flags = ["nodejs_compat"]`: enables Node.js APIs in Workers (needed for some npm packages)
- `binding = "CACHE"`: the variable name used in your function code (`env.CACHE`)
- `id`: your KV namespace ID (get this after creating the namespace — see Wrangler CLI Reference below)

---

## Tasks Checklist

### Phase 1: Project Setup
- [ ] Initialize Vite + React project
- [ ] Install dependencies: `tailwindcss`, `recharts`, `framer-motion`, `postcss`, `autoprefixer`, `wrangler`
- [ ] Configure Tailwind with dark mode (`class` strategy)
- [ ] Set up `wrangler.toml` with KV binding and cron trigger
- [ ] Create basic project structure (folders, entry files)
- [ ] Set up `index.html` with OG meta tags, favicon, title
- [ ] Add `package.json` scripts: `dev`, `build`, `preview`, `deploy`
- [ ] Create `.dev.vars.example` file showing required env vars (without actual values)
- [ ] Set up `.gitignore` (include `.dev.vars`, `.wrangler/`, `node_modules/`, `dist/`)

### Phase 2: Backend — API Route
- [ ] Create a mock data JSON file matching the expected API response shape (for frontend development before real APIs are connected)
- [ ] Create `functions/api/data.js` — main GET endpoint
- [ ] Implement KV cache read logic (try cache first)
- [ ] Implement `fetchRadarData()` — call Cloudflare Radar `domain/{domain}` endpoint for bucket data (twitter.com → top 200, x.com → top 500)
- [ ] Implement `fetchTrancoData()` — call Tranco API for current rank of both domains
- [ ] Implement cache-miss fallback (fetch live → save to KV → return)
- [ ] Add proper error handling (if one source fails, return partial data with error flags)
- [ ] Set `Cache-Control` response headers
- [ ] (DEFER) Google Trends — skip for MVP, add in Phase 9. Launch with Cloudflare Radar + Tranco first.

### Phase 3: Backend — Cron / Cache Refresh
- [ ] For MVP: rely on KV TTL expiration (24hr) + cache-miss fallback in API route — no separate cron needed
- [ ] Ensure `expirationTtl: 86400` is set on KV writes so cache auto-expires daily
- [ ] For Tranco historical accumulation: when cache-miss triggers, read existing Tranco history from KV, append today's rank, write back
- [ ] (LATER) Create a standalone Cloudflare Worker with cron trigger for guaranteed daily refresh

### Phase 4: Frontend — Layout & Navigation
- [ ] Create `Layout.jsx` — page wrapper with dark mode toggle
- [ ] Create `App.jsx` — single-page scroll structure
- [ ] Create `useData.js` hook — `fetch("/api/data")` with loading/error states
- [ ] Create `LoadingSkeleton.jsx` — skeleton screens while data loads
- [ ] Create `Footer.jsx` — data source credits, "last updated" timestamp

### Phase 5: Frontend — Chart Components
- [ ] Create `TimeRangeSelector.jsx` — reusable 1M/6M/1Y/3Y/ALL buttons
- [ ] Create `ChartWrapper.jsx` — Framer Motion scroll-triggered animation wrapper
- [ ] Create `RebrandAnnotation.jsx` — Recharts `<ReferenceLine>` for July 24, 2023
- [ ] Implement `filterByRange.js` utility
- [ ] Create `HeroSection.jsx` — Tranco ranks as big numbers + Radar bucket badges
- [ ] Create `RankingChart.jsx` — Recharts LineChart, two lines, inverted Y-axis, time range selector, rebrand annotation (primary chart)
- [ ] Create `VerdictSection.jsx` — computed verdict from Tranco data + Radar bucket context, shareable design
- [ ] (PLACEHOLDER) `TrendsChart.jsx` — create with placeholder "Coming soon" state, wire up later

### Phase 6: Deployment (deploy early, iterate live)
- [ ] Create Cloudflare account and Pages project
- [ ] Create KV namespace and bind in wrangler.toml
- [ ] Generate Cloudflare API token for Radar API
- [ ] Set environment variables in Cloudflare dashboard
- [ ] Connect GitHub repo to Cloudflare Pages
- [ ] Deploy and test
- [ ] Add custom domain `didtwitterdie.com`
- [ ] Test cron job execution
- [ ] Verify KV caching is working

### Phase 7: Styling & Polish
- [ ] Responsive design — test on mobile widths (375px, 390px, 414px)
- [ ] Dark mode — ensure all charts and text work in both modes
- [ ] Chart tooltips — clean, informative, mobile-friendly
- [ ] Scroll animations — each section animates in on scroll
- [ ] Loading states — skeleton screens that match the layout
- [ ] Error states — graceful handling if API fails
- [ ] "Last updated X hours ago" display in footer

### Phase 8: SEO & Social Sharing
- [ ] OG meta tags in `index.html` (title, description, image)
- [ ] Consider dynamic OG image generation showing current verdict
- [ ] Proper `<title>` and `<meta description>`
- [ ] Favicon

### Phase 9: Nice-to-haves (post-launch)
- [ ] Add Google Trends integration (Section 3: TrendsChart) using `google-trends-api` npm package or GitHub Actions + pytrends
- [ ] Add regional breakdown chart when Google Trends (which has per-country data) is available
- [ ] Add Radar Internet Services ranking chart — "X / Twitter" is ranked #31 among internet services with weekly time series (endpoint: `GET /radar/ranking/internet_services/timeseries_groups?limit=50`)
- [ ] Animated number count-up in hero section
- [ ] "Share this" button that copies a pre-formatted tweet
- [ ] Weekly email digest (Cloudflare Email Workers)
- [ ] Historical "this week in Twitter death" highlights
- [ ] Compare with other social platforms (Threads, Bluesky, Mastodon)
- [ ] Embed widget that other sites can use
- [ ] Migrate `functions/` to [Hono](https://hono.dev) if the API grows beyond 2-3 endpoints — enables routing, middleware, and typed OpenAPI client generation
