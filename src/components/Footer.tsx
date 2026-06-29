import { buildInfo } from "@/utils/buildInfo";
import GitHubIcon from "@/components/GitHubIcon";

interface FooterProps {
  updatedAt?: number | null;
  latestTrancoRankDate?: string | null;
  currentPage?: "dashboard" | "methodology" | "privacy" | "not-found";
}

function formatFooterDate(value: string): string {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}

function formatFooterDateTime(value: number | string): string {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

export default function Footer({
  updatedAt,
  latestTrancoRankDate,
  currentPage = "dashboard",
}: FooterProps) {
  const formatted = updatedAt ? formatFooterDateTime(updatedAt) : null;
  const formattedLatestTrancoRankDate = latestTrancoRankDate
    ? formatFooterDate(latestTrancoRankDate)
    : null;
  const formattedBuildTime = buildInfo.buildTime ? formatFooterDateTime(buildInfo.buildTime) : null;
  const refreshTooltip = formattedLatestTrancoRankDate
    ? `Latest Tranco rank date: ${formattedLatestTrancoRankDate}`
    : null;

  return (
    <footer className="mt-20 border-t border-gray-200 pb-8 pt-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col items-center gap-1 text-center text-xs sm:items-start sm:text-left sm:text-sm">
          {formatted && (
            <span
              tabIndex={refreshTooltip ? 0 : undefined}
              className="group relative inline-flex cursor-help outline-none"
            >
              Last refreshed {formatted}
              {refreshTooltip && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[min(320px,calc(100vw-2rem))] -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 py-1.5 text-center text-xs text-gray-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:left-0 sm:translate-x-0 sm:text-left"
                >
                  {refreshTooltip}
                </span>
              )}
            </span>
          )}
          {(buildInfo.shortBuildSha || formattedBuildTime) && (
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
              <span>
                Built
                {buildInfo.shortBuildSha && (
                  <>
                    {" ("}
                    <a
                      href={buildInfo.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={formattedBuildTime ?? undefined}
                      className="font-medium underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {buildInfo.shortBuildSha}
                    </a>
                    )
                  </>
                )}
                {formattedBuildTime && ` ${formattedBuildTime}`}
              </span>
            </div>
          )}
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end"
        >
          {currentPage !== "dashboard" && (
            <a
              href="/"
              className="font-medium underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
            >
              Dashboard
            </a>
          )}
          {currentPage !== "methodology" && (
            <a
              href="/methodology"
              className="font-medium underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
            >
              Sources & methodology
            </a>
          )}
          {currentPage !== "privacy" && (
            <a
              href="/privacy"
              className="font-medium underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
            >
              Privacy
            </a>
          )}
          <a
            href="mailto:contact@didtwitterdie.com"
            className="font-medium underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
          >
            contact@didtwitterdie.com
          </a>
          <a
            href={buildInfo.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
          >
            <GitHubIcon />
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
