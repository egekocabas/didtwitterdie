import { useEffect, useState } from "react";

const STARS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const STORAGE_KEY_PREFIX = "github-stars:";

interface GitHubStarsCacheEntry {
  fetchedAt: number;
  stars: number;
}

const memoryCache = new Map<string, GitHubStarsCacheEntry>();
const pendingRequests = new Map<string, Promise<number>>();

function getStorageKey(repo: string): string {
  return `${STORAGE_KEY_PREFIX}${repo}`;
}

function isValidCacheEntry(value: unknown): value is GitHubStarsCacheEntry {
  if (!value || typeof value !== "object") return false;

  const entry = value as Partial<GitHubStarsCacheEntry>;

  return typeof entry.stars === "number" && typeof entry.fetchedAt === "number";
}

function isFresh(entry: GitHubStarsCacheEntry): boolean {
  return Date.now() - entry.fetchedAt < STARS_CACHE_TTL_MS;
}

function readStoredCache(repo: string): GitHubStarsCacheEntry | null {
  try {
    const raw = window.localStorage.getItem(getStorageKey(repo));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isValidCacheEntry(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

function getCachedStars(repo: string): GitHubStarsCacheEntry | null {
  const memoryEntry = memoryCache.get(repo);
  if (memoryEntry) return memoryEntry;

  const storedEntry = readStoredCache(repo);
  if (!storedEntry) return null;

  memoryCache.set(repo, storedEntry);
  return storedEntry;
}

function writeCache(repo: string, entry: GitHubStarsCacheEntry): void {
  memoryCache.set(repo, entry);

  try {
    window.localStorage.setItem(getStorageKey(repo), JSON.stringify(entry));
  } catch {
    // Ignore storage failures so the UI still works without persistence.
  }
}

async function fetchStars(repo: string): Promise<number> {
  const existingRequest = pendingRequests.get(repo);
  if (existingRequest) return existingRequest;

  const request = fetch(`https://api.github.com/repos/${repo}`)
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json() as Promise<{ stargazers_count: number }>;
    })
    .then((data) => {
      const entry = {
        fetchedAt: Date.now(),
        stars: data.stargazers_count,
      };

      writeCache(repo, entry);
      return entry.stars;
    })
    .finally(() => {
      pendingRequests.delete(repo);
    });

  pendingRequests.set(repo, request);
  return request;
}

export function useGitHubStars(repo: string): number | null {
  const cachedEntry = getCachedStars(repo);
  const [state, setState] = useState<{ repo: string; stars: number | null }>(() => ({
    repo,
    stars: cachedEntry?.stars ?? null,
  }));

  useEffect(() => {
    if (cachedEntry && isFresh(cachedEntry)) {
      return;
    }

    let cancelled = false;

    fetchStars(repo)
      .then((nextStars) => {
        if (!cancelled) {
          setState({ repo, stars: nextStars });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [cachedEntry, repo]);

  if (cachedEntry) {
    return cachedEntry.stars;
  }

  return state.repo === repo ? state.stars : null;
}
