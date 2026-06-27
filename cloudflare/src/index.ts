import { Hono } from "hono";
import { apiRoutes } from "./routes/api";
import { downloadRoutes } from "./routes/download";
import { applyCorsHeaders } from "./lib/http";
import { ensureSchema } from "./lib/store";
import { renderAdminHtml } from "./ui/admin";
import type { SubStoreEnv } from "./types";

const app = new Hono<{ Bindings: SubStoreEnv }>();

app.onError((error, c) => {
  console.log({
    level: "error",
    route: c.req.path,
    message: error.message,
    stack: error.stack,
  });
  return c.json(
    {
      status: "failed",
      error: {
        code: 500,
        message: error.message,
      },
    },
    500,
  );
});

app.options("*", (c) => {
  const origin = c.req.header("origin") || "";
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Sub-Store-Token",
    },
  });
});

app.get("/", async (c) => {
  await ensureSchema(c.env);
  return c.html(renderAdminHtml());
});

app.route("/api", apiRoutes);
app.route("/", downloadRoutes);
app.notFound((c) => c.text("Not Found", 404));

export default {
  async fetch(request: Request, env: SubStoreEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const hostname = (request.headers.get("x-forwarded-host") || request.headers.get("host") || url.hostname)
      .split(":")[0]
      .toLowerCase();
    const publicDownloadHosts = (env.SUB_STORE_PUBLIC_DOWNLOAD_HOSTS || "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);

    if (publicDownloadHosts.includes(hostname) && !url.pathname.startsWith("/download/")) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "cache-control": "no-store",
        },
      });
    }

    const response = await app.fetch(request, env, ctx);
    return applyCorsHeaders(response, request.headers.get("origin") || undefined);
  },
};
