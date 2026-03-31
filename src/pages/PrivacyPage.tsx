import { usePageMeta } from "@/hooks/usePageMeta";

const disclosures = [
  {
    title: "Cloudflare hosting and analytics",
    text:
      "The site is hosted on Cloudflare Pages and has Cloudflare Web Analytics enabled through the Cloudflare dashboard. Cloudflare describes Web Analytics as privacy-first and says it does not collect or use your visitors' personal data.",
  },
  {
    title: "Google Trends embed",
    text:
      "The Google Trends section is an official Google embed. When that chart loads, your browser connects to Google so the embedded chart can render. This site keeps that embed on by default and relies on disclosure rather than consent-gating for now.",
  },
  {
    title: "No accounts or forms",
    text:
      "The app does not offer user accounts, comments, uploads, payments, or newsletter forms. It is a read-only public dashboard that fetches external comparison data and renders charts.",
  },
];

const thirdPartyServices = [
  {
    title: "Cloudflare Web Analytics",
    href: "https://developers.cloudflare.com/web-analytics/get-started/",
    notes:
      "Enabled for site traffic measurement. Cloudflare injects the analytics snippet at the Pages level when Web Analytics is turned on.",
  },
  {
    title: "Google Trends",
    href: "https://support.google.com/trends/answer/4365538?hl=en",
    notes:
      "Used only through Google's official embeddable chart. Google's own terms and policies apply to that embedded content.",
  },
  {
    title: "Cloudflare APIs and public datasets",
    href: "https://radar.cloudflare.com/about",
    notes:
      "The backend fetches Cloudflare Radar API data and Cloudflare serves the app itself. Radar licensing and attribution details live on the methodology page.",
  },
];

const principles = [
  "The site is an independent commentary and data-comparison project.",
  "It is not affiliated with or endorsed by X Corp., Cloudflare, Cisco, Majestic, Google, Wikimedia Foundation, GitHub, or the Tranco authors.",
];

export default function PrivacyPage() {
  usePageMeta({
    title: "Privacy | Did Twitter Die?",
    description:
      "How didtwitterdie.com handles analytics, embeds, and third-party requests, including Cloudflare Web Analytics and Google Trends.",
    canonicalPath: "/privacy",
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
            Privacy
          </p>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Privacy & third-party services
          </h1>
          <p className="max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg">
            This site is intentionally simple, but it still relies on third-party hosting, analytics,
            and embedded content. This page explains what loads, what outside services are involved,
            and what the site does not collect.
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/30 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Independent project</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
          {principles.map((principle) => (
            <li key={principle} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {disclosures.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Third-party requests</h2>
          <div className="mt-4 space-y-4">
            {thirdPartyServices.map((service) => (
              <div key={service.title} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                  <a
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Official docs
                  </a>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{service.notes}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What this site does not do</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
              <span>No user registration, sign-in, or profile storage.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
              <span>No contact form, newsletter signup, checkout flow, or on-site payments.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
              <span>No user-submitted content or public posting tools.</span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
