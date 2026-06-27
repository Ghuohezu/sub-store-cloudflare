import { Hono } from "hono";
import type { Context } from "hono";
import { failed, isTokenValid } from "../lib/http";
import { buildSubscription, getTargetContentType, normalizeTarget } from "../lib/subscription";
import { ensureSchema, getProfile, getRoutingTemplate, getStoredCollection, getStoredSubscriptions } from "../lib/store";
import type { SubStoreEnv } from "../types";

export const downloadRoutes = new Hono<{ Bindings: SubStoreEnv }>();

type DownloadContext = Context<{ Bindings: SubStoreEnv }>;

function getDownloadToken(c: DownloadContext) {
  return c.req.param("token") || c.req.query("token");
}

async function rejectInvalidDownloadToken(c: DownloadContext) {
  if (await isTokenValid(c.env.SUB_STORE_PUBLIC_DOWNLOAD_TOKEN, getDownloadToken(c))) return undefined;
  return failed(c, "Download token is invalid", 403);
}

function subscriptionResponse(body: string, target: ReturnType<typeof normalizeTarget>) {
  return new Response(body, {
    headers: {
      "content-type": getTargetContentType(target),
      "profile-update-interval": "6",
      "cache-control": "no-store",
    },
  });
}

downloadRoutes.get("/download/:profile/:target?/:token?", async (c) => {
  const invalidToken = await rejectInvalidDownloadToken(c);
  if (invalidToken) return invalidToken;

  await ensureSchema(c.env);
  const profile = await getProfile(c.env, c.req.param("profile"));
  if (!profile || !profile.enabled) return failed(c, "Profile not found", 404);

  const target = normalizeTarget(c.req.param("target") || c.req.query("target") || profile.target, c.req.header("user-agent") || "");
  const collection = await getStoredCollection(c.env, profile.collectionId);
  if (!collection) return failed(c, "Collection not found", 404);

  const allSubs = await getStoredSubscriptions(c.env);
  const template = await getRoutingTemplate(c.env, profile.templateId || collection.templateId);

  try {
    const body = await buildSubscription({
      collection,
      allSubs,
      requestUrl: new URL(c.req.url),
      target,
      template,
    });
    return subscriptionResponse(body, target);
  } catch (error) {
    return failed(c, error instanceof Error ? error.message : String(error), 500);
  }
});
