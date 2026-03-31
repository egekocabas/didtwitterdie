/// <reference types="@cloudflare/workers-types" />

interface Env {
  CACHE: KVNamespace;
  REFRESH_SECRET: string;
}

const FULL_REFRESH_CRON = "0 6 * * *";
const UMBRELLA_BACKFILL_CRON = "0 9,13,17,21 * * *";

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    if (controller.cron === UMBRELLA_BACKFILL_CRON) {
      ctx.waitUntil(backfillUmbrella(env));
      return;
    }

    if (controller.cron === FULL_REFRESH_CRON) {
      ctx.waitUntil(refresh(env));
      return;
    }

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

async function backfillUmbrella(env: Env): Promise<void> {
  const res = await fetch(
    `https://didtwitterdie.com/api/data?backfill=${encodeURIComponent(env.REFRESH_SECRET)}&source=umbrella`,
  );

  if (!res.ok) {
    throw new Error(`Umbrella backfill failed: ${res.status}`);
  }

  await env.CACHE.put("last_umbrella_backfill", new Date().toISOString());
}
