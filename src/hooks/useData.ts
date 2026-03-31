import { useState, useEffect } from "react";
import type { ApiResponse } from "@/types";

interface UseDataResult {
  data: ApiResponse | null;
  loading: boolean;
  error: string | null;
}

export function useData(): UseDataResult {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then((d) => setData(d))
      .catch(() => {
        return import("@/utils/mockData.json").then((mod) =>
          setData(mod.default as ApiResponse)
        );
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
