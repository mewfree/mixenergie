import { mixCacheControl } from "../shared/cache.ts";
import { PROVINCE_IDS, type ProvinceId } from "../shared/types.ts";
import { logError } from "./log.ts";
import { refreshMix, serveMix } from "./store.ts";

const CORS = { "Access-Control-Allow-Origin": "*" };

/** /api/mix is Quebec for backwards compatibility; others are /api/mix/<id>. */
function provinceFromPath(pathname: string): ProvinceId | null {
  if (pathname === "/api/mix") return "qc";
  const match = /^\/api\/mix\/([a-z]+)$/.exec(pathname);
  const id = match?.[1];
  return PROVINCE_IDS.find((province) => province === id) ?? null;
}

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

    const province = provinceFromPath(url.pathname);
    if (!province) {
      return json({ error: "not found" }, 404, "no-store");
    }

    try {
      const result = await serveMix(env, ctx, province);
      return json(result.payload, 200, mixCacheControl(result.state), {
        "X-Mix-Cache": result.state,
        "X-Mix-Age": String(result.ageSeconds),
      });
    } catch (error) {
      logError(`${province} mix fetch failed`, error);
      return json({ error: "upstream unavailable" }, 502, "no-store");
    }
  },

  async scheduled(_controller, env) {
    await Promise.all(
      PROVINCE_IDS.map(async (province) => {
        try {
          await refreshMix(env, province);
          console.log(JSON.stringify({ message: "mix cron refresh ok", province }));
        } catch (error) {
          logError(`${province} mix cron refresh failed`, error);
        }
      }),
    );
  },
} satisfies ExportedHandler<Env>;
