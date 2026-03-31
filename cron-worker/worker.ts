/// <reference types="@cloudflare/workers-types" />

interface Env {
  CACHE: KVNamespace;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(refresh(env));
  },
};

async function refresh(env: Env): Promise<void> {
  const res = await fetch("https://didtwitterdie.com/api/data?refresh=true");
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`);
  }
  await env.CACHE.put("last_refreshed", new Date().toISOString());
}
