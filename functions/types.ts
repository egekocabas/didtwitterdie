/// <reference types="@cloudflare/workers-types" />

export interface Env {
  CLOUDFLARE_RADAR_TOKEN: string;
  CACHE: KVNamespace;
}
