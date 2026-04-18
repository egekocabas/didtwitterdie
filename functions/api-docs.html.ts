const API_DOCS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Did Twitter Die? API Docs</title>
    <meta name="description" content="Public API documentation for the didtwitterdie.com dataset." />
    <style>
      :root {
        color-scheme: light dark;
        --bg: #f5f1ea;
        --card: rgba(255, 255, 255, 0.9);
        --text: #18181b;
        --muted: #52525b;
        --border: rgba(24, 24, 27, 0.1);
        --accent: #a16207;
        --code-bg: rgba(24, 24, 27, 0.05);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #111215;
          --card: rgba(24, 24, 27, 0.92);
          --text: #f4f4f5;
          --muted: #c4c4cc;
          --border: rgba(244, 244, 245, 0.12);
          --accent: #fbbf24;
          --code-bg: rgba(244, 244, 245, 0.08);
        }
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(251, 191, 36, 0.14), transparent 28rem),
          linear-gradient(180deg, rgba(161, 98, 7, 0.06), transparent 22rem),
          var(--bg);
        color: var(--text);
      }
      main { max-width: 56rem; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
      .eyebrow {
        margin: 0 0 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.78rem;
        color: var(--accent);
        font-weight: 700;
      }
      h1 { margin: 0; font-size: clamp(2.2rem, 5vw, 3.8rem); line-height: 1; }
      p { line-height: 1.65; color: var(--muted); }
      section {
        margin-top: 1.5rem;
        padding: 1.4rem;
        border: 1px solid var(--border);
        border-radius: 1.25rem;
        background: var(--card);
        backdrop-filter: blur(10px);
      }
      h2 { margin: 0 0 0.85rem; font-size: 1.2rem; }
      ul { margin: 0.75rem 0 0; padding-left: 1.1rem; color: var(--muted); }
      li + li { margin-top: 0.55rem; }
      code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      code {
        padding: 0.1rem 0.35rem;
        border-radius: 0.45rem;
        background: var(--code-bg);
        color: var(--text);
      }
      pre {
        overflow-x: auto;
        margin: 0.9rem 0 0;
        padding: 1rem;
        border-radius: 1rem;
        background: var(--code-bg);
        color: var(--text);
      }
      a {
        color: inherit;
        text-decoration-thickness: 0.08em;
        text-underline-offset: 0.18em;
      }
      .grid { display: grid; gap: 1rem; }
      @media (min-width: 720px) {
        .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Public API</p>
      <h1>Did Twitter Die? API docs</h1>
      <p>
        This API exposes the same public, read-only dataset used by
        <a href="https://didtwitterdie.com/">didtwitterdie.com</a>. It is designed for fetching
        the latest comparison snapshot and basic cache metadata without authentication.
      </p>

      <section>
        <h2>Access and freshness</h2>
        <ul>
          <li><code>/api/data</code> is public and does not require auth.</li>
          <li>Responses are cached for up to one hour at the HTTP layer.</li>
          <li>The underlying snapshot is refreshed by background jobs when available and can lag individual upstream sources.</li>
          <li>Use <code>updated_at</code> in the response body to know when the cached dataset was last assembled.</li>
        </ul>
      </section>

      <div class="grid">
        <section>
          <h2><code>GET /api/data</code></h2>
          <p>
            Returns the current dataset snapshot for the dashboard, including ranking, DNS, and
            supporting context series.
          </p>
          <ul>
            <li>Top-level source sections may be <code>null</code> when an upstream source fails.</li>
            <li><code>trends</code> is reserved and currently always <code>null</code>.</li>
            <li>An <code>errors</code> array may be present when one or more sources fail.</li>
          </ul>
          <pre><code>curl https://didtwitterdie.com/api/data</code></pre>
        </section>

        <section>
          <h2><code>GET /api/status</code></h2>
          <p>
            Returns lightweight metadata about cache health and the most recent scheduled refresh
            time known to the site.
          </p>
          <ul>
            <li><code>updated_at</code> is <code>null</code> if no dataset cache exists yet.</li>
            <li><code>last_refreshed</code> is <code>null</code> if no refresh timestamp has been stored yet.</li>
          </ul>
          <pre><code>curl https://didtwitterdie.com/api/status</code></pre>
        </section>
      </div>

      <section>
        <h2>Response shape overview</h2>
        <ul>
          <li><code>radar</code>: current Cloudflare Radar DNS bucket comparison.</li>
          <li><code>tranco</code>: historical Tranco rank series for <code>twitter.com</code> and <code>x.com</code>.</li>
          <li><code>radarServices</code>: broader X / Twitter service ranking context.</li>
          <li><code>umbrella</code>, <code>majestic</code>, <code>wikipedia</code>: supporting signals and narrative context.</li>
          <li><code>updated_at</code>: Unix timestamp in milliseconds for the assembled cache.</li>
        </ul>
        <p>
          For the full machine-readable schema, see
          <a href="/openapi.json"><code>/openapi.json</code></a>.
        </p>
      </section>

      <section>
        <h2>Interpretation and caveats</h2>
        <p>
          The API publishes a comparative dataset, not a traffic oracle. Source roles, licensing
          posture, and caveats are documented on the
          <a href="/methodology">Sources &amp; methodology page</a>.
        </p>
      </section>
    </main>
  </body>
</html>
`;

export function onRequestGet(): Response {
  return new Response(API_DOCS_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
