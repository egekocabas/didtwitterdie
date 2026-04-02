import { buildInfo } from "@/utils/buildInfo";
import GitHubIcon from "@/components/GitHubIcon";

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
            <GitHubIcon />
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
