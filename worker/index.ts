import { mixCacheControl } from "../shared/cache.ts";
import { refreshMix, serveMix } from "./store.ts";

function json(
  data: unknown,
  status = 200,
  extra: Record<string, string> = {},
): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": mixCacheControl("fresh"),
      "Access-Control-Allow-Origin": "*",
      ...extra,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname !== "/api/mix") {
      return json({ error: "not found" }, 404, { "Cache-Control": "no-store" });
    }

    try {
      const result = await serveMix(env, ctx);
      return json(result.payload, 200, {
        "Cache-Control": mixCacheControl(result.state),
        "X-Mix-Cache": result.state,
        "X-Mix-Age": String(result.ageSeconds),
      });
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "mix fetch failed",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      return json({ error: "upstream unavailable" }, 502, {
        "Cache-Control": "no-store",
      });
    }
  },

  async scheduled(_controller, env) {
    try {
      await refreshMix(env);
      console.log(JSON.stringify({ message: "mix cron refresh ok" }));
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "mix cron refresh failed",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },
} satisfies ExportedHandler<Env>;
