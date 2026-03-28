interface FooterProps {
  updatedAt?: number | null;
}

export default function Footer({ updatedAt }: FooterProps) {
  const formatted = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <footer className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 space-y-2 pb-8">
      <p>
        Data from{" "}
        <a
          href="https://radar.cloudflare.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cloudflare Radar
        </a>{" "}
        and{" "}
        <a
          href="https://tranco-list.eu"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Tranco List
        </a>{" "}
        (
        <a
          href="https://doi.org/10.14722/ndss.2019.23386"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Le Pochat et al., NDSS 2019
        </a>
        )
      </p>
      <p>
        Cloudflare Radar data licensed under{" "}
        <a
          href="https://creativecommons.org/licenses/by-nc/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          CC BY-NC 4.0
        </a>
      </p>
      <p>Cloudflare and Cloudflare Radar are trademarks of Cloudflare, Inc.</p>
      {formatted && <p>Last updated: {formatted}</p>}
      <p>
        <a
          href="https://github.com/egekocabas/didtwitterdie"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg
            height="16"
            width="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Open source on GitHub
        </a>
      </p>
    </footer>
  );
}
