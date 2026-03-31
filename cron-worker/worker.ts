/// <reference types="@cloudflare/workers-types" />

interface Env {
  CACHE: KVNamespace;
  REFRESH_SECRET: string;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(refresh(env));
  },
};

async function refresh(env: Env): Promise<void> {
  const res = await fetch(`https://didtwitterdie.com/api/data?refresh=${encodeURIComponent(env.REFRESH_SECRET)}`);
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`);
  }
  await env.CACHE.put("last_refreshed", new Date().toISOString());
}
