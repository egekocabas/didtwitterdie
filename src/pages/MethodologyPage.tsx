import { usePageMeta } from "@/hooks/usePageMeta";

const dataSources = [
  {
    title: "Tranco List",
    href: "https://tranco-list.eu",
    measure: "Aggregated domain popularity rank across multiple independent signals.",
    role: "Primary verdict input and the main long-term domain popularity chart.",
    notes:
      "This is the strongest single summary signal because it combines several independent ranking systems rather than one source alone.",
  },
  {
    title: "Cloudflare Radar Domain Ranking",
    href: "https://radar.cloudflare.com",
    measure: "DNS popularity bucket for direct domain usage on Cloudflare's 1.1.1.1 resolver.",
    role: "Primary verdict input and hero-level context.",
    notes:
      "Radar exposes bucketed rank bands for twitter.com and x.com here, not exact per-domain ranks.",
  },
  {
    title: "Cloudflare Radar Internet Services",
    href: "https://radar.cloudflare.com",
    measure: "Service-level social media rank for X / Twitter.",
    role: "Supporting evidence only.",
    notes:
      "This section helps show where X / Twitter sits among large social platforms, but it is not currently weighted into the verdict score.",
  },
  {
    title: "Cisco Umbrella Top 1M",
    href: "https://umbrella-static.s3-us-west-1.amazonaws.com/index.html",
    measure: "Direct DNS-based domain ranking from Cisco Umbrella traffic.",
    role: "Supporting evidence and direct rank signal.",
    notes:
      "Historical Cisco data is backfilled gradually from archived quarter-end snapshots so the series gets richer over time.",
  },
  {
    title: "Majestic Million",
    href: "https://majestic.com/reports/majestic-million",
    measure: "Web-graph and backlink-based domain popularity.",
    role: "Supporting evidence and direct rank signal.",
    notes:
      "Majestic is currently forward-accumulated from the project's rollout rather than fully backfilled historically.",
  },
  {
    title: "Wikimedia Pageviews",
    href: "https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/",
    measure: "Interest around the Wikipedia titles tied to Twitter and X.",
    role: "Narrative context only.",
    notes:
      "This section is best read as attention around page titles, not as a direct domain-usage signal.",
  },
  {
    title: "Google Trends",
    href: "https://trends.google.com",
    measure: "Relative search interest for Twitter-related terms.",
    role: "Narrative context only.",
    notes:
      "The project uses the official Google Trends embed instead of scraping unofficial endpoints.",
  },
];

const methodologyPoints = [
  {
    title: "Verdict logic",
    text:
      "The verdict intentionally stays conservative. Right now it is driven by Tranco plus Cloudflare Radar's direct domain bucket signal. The newer comparison sources appear as supporting evidence, not as extra weight in the score.",
  },
  {
    title: "What the score means",
    text:
      "The page is comparing relative strength between twitter.com and x.com, not trying to produce a scientific aliveness metric. That is why the UI now leans on the verdict headline instead of a standalone percentage label.",
  },
  {
    title: "How history is built",
    text:
      "Some providers only expose current snapshots or limited windows, so the project stores and merges time-series data in KV over repeated refreshes. Umbrella historical backfill now runs separately from the main refresh to keep the live refresh path lighter and more reliable.",
  },
];

const caveats = [
  "twitter.com currently redirects to x.com, so domain popularity should be read as usage of the entered domain or resolved hostname signal, not as a perfect proxy for destination traffic.",
  "The Wikipedia comparison is tricky because the Twitter article path redirects to the X article on Wikipedia. The chart is therefore best interpreted as title-level attention, not two fully independent articles.",
  "Cloudflare Radar's domain endpoint returns popularity buckets rather than exact ranks for these domains.",
  "Cisco archive availability can lag, so a missing quarter may temporarily remain unavailable even when the backfill worker is trying to fetch it.",
];

export default function MethodologyPage() {
  usePageMeta({
    title: "Sources & Methodology | Did Twitter Die?",
    description:
      "How didtwitterdie.com compares twitter.com and x.com, which sources it uses, and what each metric actually means.",
    canonicalPath: "/methodology",
  });

  return (
    <div className="space-y-12 pt-8 sm:pt-12">
      <header className="space-y-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to dashboard
        </a>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
            About The Data
          </p>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Sources & methodology
          </h1>
          <p className="max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg">
            The site is meant to be playful, but the underlying comparisons are real. This page explains
            what each source measures, which signals actually feed the verdict, and where the data still
            has edges or limitations.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {methodologyPoints.map((point) => (
          <article
            key={point.title}
            className="rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{point.title}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{point.text}</p>
          </article>
        ))}
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data sources</h2>
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
            Each source says something slightly different. That is useful, but it also means the charts
            should be interpreted as complementary evidence rather than interchangeable measurements.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {dataSources.map((source) => (
            <article
              key={source.title}
              className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{source.title}</h3>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm font-medium text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Visit source
                </a>
              </div>
              <dl className="mt-4 space-y-4 text-sm leading-6">
                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">Measures</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{source.measure}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">Used for</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{source.role}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">Notes</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{source.notes}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Important caveats</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {caveats.map((caveat) => (
              <li key={caveat} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
                <span>{caveat}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attribution</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
            <p>
              Tranco citation:{" "}
              <a
                href="https://doi.org/10.14722/ndss.2019.23386"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                Le Pochat et al., NDSS 2019
              </a>
            </p>
            <p>
              Cloudflare Radar data is licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by-nc/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                CC BY-NC 4.0
              </a>
              .
            </p>
            <p>Cloudflare and Cloudflare Radar are trademarks of Cloudflare, Inc.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
