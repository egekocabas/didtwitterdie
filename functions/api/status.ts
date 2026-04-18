import type { Env } from "../types";
import type { ApiResponse } from "@/types";

interface StatusResponse {
  ok: true;
  service: "didtwitterdie";
  public: true;
  updated_at: number | null;
  last_refreshed: string | null;
}

const STATUS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300",
};

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const cached = await env.CACHE.get<ApiResponse>("all_data", "json");
  const lastRefreshed = await env.CACHE.get("last_refreshed");

  const body: StatusResponse = {
    ok: true,
    service: "didtwitterdie",
    public: true,
    updated_at: cached?.updated_at ?? null,
    last_refreshed: lastRefreshed ?? null,
  };

  return new Response(JSON.stringify(body), {
    headers: STATUS_HEADERS,
  });
}
