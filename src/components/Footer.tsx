import { buildInfo } from "@/utils/buildInfo";

interface FooterProps {
  updatedAt?: number | null;
  currentPage?: "dashboard" | "methodology" | "privacy";
}

export default function Footer({ updatedAt, currentPage = "dashboard" }: FooterProps) {
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
    <footer className="mt-20 border-t border-gray-200 pb-8 pt-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:justify-start sm:text-sm">
          {formatted && <span>Data updated {formatted}</span>}
          {formatted && buildInfo.shortBuildSha && (
            <span className="hidden text-gray-300 dark:text-gray-700 sm:inline" aria-hidden="true">
              •
            </span>
          )}
          {buildInfo.shortBuildSha && (
            <a
              href={buildInfo.commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
            >
              Build {buildInfo.shortBuildSha}
            </a>
          )}
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
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
            href={buildInfo.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
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
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
