import { useState, useEffect } from "react";

export function useGitHubStars(repo: string): number | null {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<{ stargazers_count: number }>;
      })
      .then((d) => setStars(d.stargazers_count))
      .catch(() => {});
  }, [repo]);

  return stars;
}
