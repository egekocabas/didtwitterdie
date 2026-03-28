# didtwitterdie.com

> Did Twitter die when it rebranded to X?

A single-page data dashboard comparing the popularity of `twitter.com` vs `x.com` since the July 2023 rebrand — using real data from Tranco domain rankings, Cloudflare Radar DNS, and Google Trends search interest.

**Live site**: [didtwitterdie.com](https://didtwitterdie.com)

---

## What it shows

- **Domain popularity over time** — Tranco List rankings (aggregated from Cloudflare DNS, Cisco Umbrella, Chrome UX, Majestic, Farsight)
- **DNS traffic bucket** — Cloudflare Radar classification (Top 200 / Top 500)
- **Search interest** — Google Trends for "twitter" vs "x.com" vs "x" since 2022
- **The verdict** — a single % alive score based on relative domain ranking

## Tech stack

- **Frontend**: Vite + React, Tailwind CSS v4, Recharts, Framer Motion
- **Backend**: Cloudflare Pages Functions + Workers KV (24hr cache)
- **Data sources**: Tranco List, Cloudflare Radar API, Google Trends (embed)

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for full architecture, data source details, local dev setup, and deployment instructions.

## License & Attribution

See [ATTRIBUTION.md](ATTRIBUTION.md) for data source licenses and trademark notices.
