import { buildInfo } from "@/utils/buildInfo";
import GitHubIcon from "@/components/GitHubIcon";

interface FooterProps {
  updatedAt?: number | null;
  currentPage?: "dashboard" | "methodology" | "privacy" | "not-found";
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

export default function Footer({ updatedAt, currentPage = "dashboard" }: FooterProps) {
  const formatted = updatedAt ? formatFooterDateTime(updatedAt) : null;
  const formattedBuildTime = buildInfo.buildTime ? formatFooterDateTime(buildInfo.buildTime) : null;

  return (
    <footer className="mt-20 border-t border-gray-200 pb-8 pt-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col items-center gap-1 text-center text-xs sm:items-start sm:text-left sm:text-sm">
          {formatted && <span>Data updated {formatted}</span>}
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
