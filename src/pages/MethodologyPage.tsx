import { usePageMeta } from "@/hooks/usePageMeta";

interface SourceCard {
  title: string;
  sourceHref: string;
  policyHref: string;
  measure: string;
  role: string;
  terms: string;
  caveat: string;
}

const methodologyPoints = [
  {
    title: "What drives the verdict",
    text:
      "The live verdict is intentionally narrow. It currently uses Tranco plus Cloudflare Radar's direct domain bucket signal. Everything else stays visible as supporting evidence instead of silently changing the score.",
  },
  {
    title: "How reuse is handled",
    text:
      "The app shows limited comparative excerpts and time-series merges rather than mirroring whole third-party datasets. That matters because the upstream sources do not all have equally clear public reuse terms.",
  },
  {
    title: "How the history is built",
    text:
      "Some providers only expose current snapshots or short windows, so the project stores and merges history in KV over time. Cisco Umbrella backfill now runs separately from the daily refresh to keep the live refresh path lighter.",
  },
];

const sourceCards: SourceCard[] = [
  {
    title: "Tranco List",
    sourceHref: "https://tranco-list.eu",
    policyHref: "https://doi.org/10.14722/ndss.2019.23386",
    measure: "Aggregated domain popularity rank across multiple independent inputs.",
    role: "Primary verdict input and the main long-term domain popularity chart.",
    terms:
      "The NDSS 2019 citation is retained. The official pages reviewed did not clearly publish a standalone reuse license for Tranco's aggregated output, so this project treats the data as a narrow comparative excerpt rather than a cleanly licensed mirror.",
    caveat:
      "Because Tranco blends several upstream sources, it is strongest as a broad consensus signal, not as an exact traffic count.",
  },
  {
    title: "Cloudflare Radar Domain Ranking",
    sourceHref: "https://radar.cloudflare.com",
    policyHref: "https://radar.cloudflare.com/about",
    measure: "DNS popularity bucket for direct domain usage on Cloudflare's 1.1.1.1 resolver.",
    role: "Primary verdict input and hero-level context.",
    terms:
      "Radar API data is available under CC BY-NC 4.0. Cloudflare's trademarks and branding are not covered by that license, so the site uses text references only and avoids implying endorsement.",
    caveat:
      "For these domains, Radar exposes bucket bands rather than exact ranks, so the signal is directional rather than precise.",
  },
  {
    title: "Cloudflare Radar Internet Services",
    sourceHref: "https://radar.cloudflare.com",
    policyHref: "https://radar.cloudflare.com/about",
    measure: "Service-level social-media rank for X / Twitter as a broader platform.",
    role: "Supporting evidence only.",
    terms:
      "This uses the same Radar licensing posture as the domain endpoint: CC BY-NC 4.0 for API data, with Cloudflare branding kept as descriptive text only.",
    caveat:
      "It reflects the broader X / Twitter service, not just the twitter.com and x.com domains compared elsewhere on the page.",
  },
  {
    title: "Cisco Umbrella Top 1M",
    sourceHref: "https://umbrella-static.s3-us-west-1.amazonaws.com/index.html",
    policyHref: "https://umbrella-static.s3-us-west-1.amazonaws.com/index.html",
    measure: "Direct DNS-based popularity ranking from Cisco Umbrella usage.",
    role: "Supporting evidence and direct rank signal.",
    terms:
      "The public list page reviewed explains the dataset and archive URLs, but it did not state an explicit public dataset license. This site therefore keeps usage narrow: only the relevant twitter.com and x.com comparisons are shown.",
    caveat:
      "Historical points are best-effort backfills from dated snapshots, so the series can fill in gradually and may temporarily lag the current snapshot.",
  },
  {
    title: "Majestic Million",
    sourceHref: "https://majestic.com/reports/majestic-million",
    policyHref: "https://majestic.com/company/terms",
    measure: "Backlink and web-graph popularity from Majestic's free million-domain list.",
    role: "Supporting evidence and direct rank signal.",
    terms:
      "The Majestic Million page advertises CC BY 3.0 for the dataset. Majestic's broader site terms and style guidance still caution against reseller-like web-tool reuse, so this project stays in the lane of attributed, limited excerpts instead of broad republishing.",
    caveat:
      "Majestic history is forward-accumulated from this project's rollout rather than fully backfilled from older public archives.",
  },
  {
    title: "Wikimedia Pageviews",
    sourceHref: "https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/",
    policyHref: "https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/access-policy.html",
    measure: "Attention around the Wikipedia titles associated with Twitter and X.",
    role: "Narrative context only.",
    terms:
      "Wikimedia Analytics API data is available under CC0 1.0. The API also requires client identification, so the backend now sends descriptive User-Agent headers for these requests.",
    caveat:
      "The Twitter title redirects to the X article on Wikipedia, so this chart is best read as title-level attention rather than two fully independent article audiences.",
  },
  {
    title: "Google Trends",
    sourceHref: "https://trends.google.com",
    policyHref: "https://support.google.com/trends/answer/4365538?hl=en",
    measure: "Relative Google search interest for Twitter-related terms.",
    role: "Narrative context only.",
    terms:
      "The site uses Google's official embed rather than scraping unofficial endpoints. Google's terms apply to the embedded chart, and the chart is explicitly attributed to Google Trends in the UI.",
    caveat:
      "Trends values are normalized relative scores, not absolute search counts, so they should not be treated as direct traffic figures.",
  },
];

export default function MethodologyPage() {
  usePageMeta({
    title: "Sources & Methodology | Did Twitter Die?",
    description:
      "How didtwitterdie.com compares twitter.com and x.com, which sources it uses, and what each signal, license, and caveat actually means.",
    canonicalPath: "/methodology",
  });

  return (
    <div className="space-y-12 pt-8 sm:pt-12">
      <header className="space-y-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
            <span aria-hidden="true">&larr;</span>
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
            The project is playful, but the comparisons are real. This page explains what each source
            measures, what role it plays in the product, and where the licensing, caveats, and red
            flags matter.
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/30 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Independent, not affiliated</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700 dark:text-gray-300">
          didtwitterdie.com is an independent commentary and data-comparison project. References to
          Twitter, X, Cloudflare, Cisco, Majestic, Google, Wikimedia, GitHub, and Tranco are
          descriptive only and should not be read as endorsement, sponsorship, or partnership.
        </p>
      </section>

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
            Each chart is tied to an official source page or policy page so the site's copy stays
            grounded in the provider's own description of the data.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sourceCards.map((source) => (
            <article
              key={source.title}
              className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{source.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    href={source.sourceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Source
                  </a>
                  <a
                    href={source.policyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Policy / docs
                  </a>
                </div>
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
                  <dt className="font-semibold text-gray-900 dark:text-white">Verified terms</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{source.terms}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">Key caveat</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{source.caveat}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
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
              Cloudflare Radar API data is licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by-nc/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                CC BY-NC 4.0
              </a>
              , which is one reason the site should be re-reviewed before any monetization.
            </p>
            <p>
              Wikimedia Analytics API data is available under{" "}
              <a
                href="https://creativecommons.org/publicdomain/zero/1.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                CC0 1.0
              </a>
              . Majestic Million advertises{" "}
              <a
                href="https://creativecommons.org/licenses/by/3.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                CC BY 3.0
              </a>
              .
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related pages</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
            <p>
              The product-level privacy and embed disclosures live on the{" "}
              <a
                href="/privacy"
                className="font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                Privacy page
              </a>
              .
            </p>
            <p>
              Repo-side notes such as internal implementation details and risk reminders are kept in
              the project documentation so they can evolve alongside the code.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
