import { mixCacheControl } from "../shared/cache.ts";
import { logError } from "./log.ts";
import { refreshMix, serveMix } from "./store.ts";

const CORS = { "Access-Control-Allow-Origin": "*" };

function json(
  data: unknown,
  status: number,
  cacheControl: string,
  extra: Record<string, string> = {},
): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": cacheControl, ...CORS, ...extra },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, {
        headers: {
          ...CORS,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname !== "/api/mix") {
      return json({ error: "not found" }, 404, "no-store");
    }

    try {
      const result = await serveMix(env, ctx);
      return json(result.payload, 200, mixCacheControl(result.state), {
        "X-Mix-Cache": result.state,
        "X-Mix-Age": String(result.ageSeconds),
      });
    } catch (error) {
      logError("mix fetch failed", error);
      return json({ error: "upstream unavailable" }, 502, "no-store");
    }
  },

  async scheduled(_controller, env) {
    try {
      await refreshMix(env);
      console.log(JSON.stringify({ message: "mix cron refresh ok" }));
    } catch (error) {
      logError("mix cron refresh failed", error);
    }
  },
} satisfies ExportedHandler<Env>;
