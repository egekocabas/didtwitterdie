import { useState, useEffect } from "react";

export function useData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => {
        console.warn("API fetch failed, falling back to mock data:", err.message);
        return import("../utils/mockData.json").then((mod) => setData(mod.default));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
