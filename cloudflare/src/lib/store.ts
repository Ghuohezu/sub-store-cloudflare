import {
  DEFAULT_COLLECTION_ID,
  DEFAULT_PROFILE_ID,
  DEFAULT_SOURCE_ID,
  DEFAULT_TEMPLATE_CONFIG,
  DEFAULT_TEMPLATE_ID,
} from "./defaults";
import type {
  AppConfig,
  CollectionRecord,
  FilterRule,
  ProfileRecord,
  SourceRecord,
  StoredCollection,
  StoredSubscription,
  SubStoreEnv,
  SubscriptionTarget,
  TemplateRecord,
} from "../types";

type JsonObject = Record<string, unknown>;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'remote',
  url TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  filters_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  filters_json TEXT NOT NULL DEFAULT '[]',
  template_id TEXT NOT NULL DEFAULT 'mihomo-basic',
  ignore_failed INTEGER NOT NULL DEFAULT 1,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'mihomo',
  config_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'mihomo',
  template_id TEXT NOT NULL DEFAULT 'mihomo-basic',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

type SourceRow = {
  id: string;
  name: string;
  type: string;
  url: string;
  content: string;
  enabled: number;
  filters_json: string;
  created_at: number;
  updated_at: number;
};

type CollectionRow = {
  id: string;
  name: string;
  source_ids_json: string;
  filters_json: string;
  template_id: string;
  ignore_failed: number;
  enabled: number;
  created_at: number;
  updated_at: number;
};

type TemplateRow = {
  id: string;
  name: string;
  target: string;
  config_json: string;
  created_at: number;
  updated_at: number;
};

type ProfileRow = {
  id: string;
  name: string;
  collection_id: string;
  target: string;
  template_id: string;
  enabled: number;
  created_at: number;
  updated_at: number;
};

export async function ensureSchema(env: SubStoreEnv) {
  const statements = SCHEMA_SQL.split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(`${statement};`).run();
  }
  await seedDefaults(env);
}

export async function getAppConfig(env: SubStoreEnv): Promise<AppConfig> {
  await ensureSchema(env);
  const [sources, collections, templates, profiles] = await Promise.all([
    listSources(env),
    listCollections(env),
    listTemplates(env),
    listProfiles(env),
  ]);
  return { sources, collections, templates, profiles };
}

export async function replaceAppConfig(env: SubStoreEnv, config: Partial<AppConfig>) {
  await ensureSchema(env);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM profiles"),
    env.DB.prepare("DELETE FROM collections"),
    env.DB.prepare("DELETE FROM templates"),
    env.DB.prepare("DELETE FROM sources"),
  ]);

  for (const source of config.sources || []) await upsertSource(env, source);
  for (const template of config.templates || []) await upsertTemplate(env, template);
  for (const collection of config.collections || []) await upsertCollection(env, collection);
  for (const profile of config.profiles || []) await upsertProfile(env, profile);
  await seedDefaults(env);
  return getAppConfig(env);
}

export async function listSources(env: SubStoreEnv) {
  const rows = await env.DB.prepare("SELECT * FROM sources ORDER BY created_at ASC").all<SourceRow>();
  return rows.results.map(sourceFromRow);
}

export async function upsertSource(env: SubStoreEnv, input: Partial<SourceRecord>) {
  await ensureSchema(env);
  const now = Date.now();
  const id = toId(input.id || input.name || "source");
  const existing = await getSource(env, id);
  const source: SourceRecord = {
    id,
    name: stringValue(input.name, existing?.name || id),
    type: input.type === "local" ? "local" : "remote",
    url: stringValue(input.url, existing?.url || ""),
    content: stringValue(input.content, existing?.content || ""),
    enabled: input.enabled ?? existing?.enabled ?? true,
    filters: normalizeFilters(input.filters || existing?.filters || []),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await env.DB.prepare(
    `INSERT INTO sources (id, name, type, url, content, enabled, filters_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       type = excluded.type,
       url = excluded.url,
       content = excluded.content,
       enabled = excluded.enabled,
       filters_json = excluded.filters_json,
       updated_at = excluded.updated_at`,
  )
    .bind(source.id, source.name, source.type, source.url, source.content, boolInt(source.enabled), JSON.stringify(source.filters), source.createdAt, source.updatedAt)
    .run();
  return source;
}

export async function getSource(env: SubStoreEnv, id: string) {
  const row = await env.DB.prepare("SELECT * FROM sources WHERE id = ?").bind(id).first<SourceRow>();
  return row ? sourceFromRow(row) : undefined;
}

export async function deleteSource(env: SubStoreEnv, id: string) {
  await ensureSchema(env);
  await env.DB.prepare("DELETE FROM sources WHERE id = ?").bind(id).run();
  return { deleted: true };
}

export async function listCollections(env: SubStoreEnv) {
  const rows = await env.DB.prepare("SELECT * FROM collections ORDER BY created_at ASC").all<CollectionRow>();
  return rows.results.map(collectionFromRow);
}

export async function upsertCollection(env: SubStoreEnv, input: Partial<CollectionRecord>) {
  await ensureSchema(env);
  const now = Date.now();
  const id = toId(input.id || input.name || "collection");
  const existing = await getCollection(env, id);
  const collection: CollectionRecord = {
    id,
    name: stringValue(input.name, existing?.name || id),
    sourceIds: stringArray(input.sourceIds || existing?.sourceIds || []),
    filters: normalizeFilters(input.filters || existing?.filters || []),
    templateId: stringValue(input.templateId, existing?.templateId || DEFAULT_TEMPLATE_ID),
    ignoreFailed: input.ignoreFailed ?? existing?.ignoreFailed ?? true,
    enabled: input.enabled ?? existing?.enabled ?? true,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await env.DB.prepare(
    `INSERT INTO collections (id, name, source_ids_json, filters_json, template_id, ignore_failed, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       source_ids_json = excluded.source_ids_json,
       filters_json = excluded.filters_json,
       template_id = excluded.template_id,
       ignore_failed = excluded.ignore_failed,
       enabled = excluded.enabled,
       updated_at = excluded.updated_at`,
  )
    .bind(
      collection.id,
      collection.name,
      JSON.stringify(collection.sourceIds),
      JSON.stringify(collection.filters),
      collection.templateId,
      boolInt(collection.ignoreFailed),
      boolInt(collection.enabled),
      collection.createdAt,
      collection.updatedAt,
    )
    .run();
  return collection;
}

export async function getCollection(env: SubStoreEnv, id: string) {
  const row = await env.DB.prepare("SELECT * FROM collections WHERE id = ?").bind(id).first<CollectionRow>();
  return row ? collectionFromRow(row) : undefined;
}

export async function deleteCollection(env: SubStoreEnv, id: string) {
  await ensureSchema(env);
  await env.DB.prepare("DELETE FROM collections WHERE id = ?").bind(id).run();
  return { deleted: true };
}

export async function listTemplates(env: SubStoreEnv) {
  const rows = await env.DB.prepare("SELECT * FROM templates ORDER BY created_at ASC").all<TemplateRow>();
  return rows.results.map(templateFromRow);
}

export async function upsertTemplate(env: SubStoreEnv, input: Partial<TemplateRecord>) {
  await ensureSchema(env);
  const now = Date.now();
  const id = toId(input.id || input.name || "template");
  const existing = await getTemplate(env, id);
  const template: TemplateRecord = {
    id,
    name: stringValue(input.name, existing?.name || id),
    target: normalizeTargetValue(input.target || existing?.target || "mihomo"),
    config: parseConfig(input.config || existing?.config || DEFAULT_TEMPLATE_CONFIG),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await env.DB.prepare(
    `INSERT INTO templates (id, name, target, config_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       target = excluded.target,
       config_json = excluded.config_json,
       updated_at = excluded.updated_at`,
  )
    .bind(template.id, template.name, template.target, JSON.stringify(template.config), template.createdAt, template.updatedAt)
    .run();
  return template;
}

export async function getTemplate(env: SubStoreEnv, id: string) {
  const row = await env.DB.prepare("SELECT * FROM templates WHERE id = ?").bind(id).first<TemplateRow>();
  return row ? templateFromRow(row) : undefined;
}

export async function deleteTemplate(env: SubStoreEnv, id: string) {
  await ensureSchema(env);
  await env.DB.prepare("DELETE FROM templates WHERE id = ?").bind(id).run();
  return { deleted: true };
}

export async function listProfiles(env: SubStoreEnv) {
  const rows = await env.DB.prepare("SELECT * FROM profiles ORDER BY created_at ASC").all<ProfileRow>();
  return rows.results.map(profileFromRow);
}

export async function upsertProfile(env: SubStoreEnv, input: Partial<ProfileRecord>) {
  await ensureSchema(env);
  const now = Date.now();
  const id = toId(input.id || input.name || "profile");
  const existing = await getProfile(env, id);
  const profile: ProfileRecord = {
    id,
    name: stringValue(input.name, existing?.name || id),
    collectionId: stringValue(input.collectionId, existing?.collectionId || DEFAULT_COLLECTION_ID),
    target: normalizeTargetValue(input.target || existing?.target || "mihomo"),
    templateId: stringValue(input.templateId, existing?.templateId || DEFAULT_TEMPLATE_ID),
    enabled: input.enabled ?? existing?.enabled ?? true,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await env.DB.prepare(
    `INSERT INTO profiles (id, name, collection_id, target, template_id, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       collection_id = excluded.collection_id,
       target = excluded.target,
       template_id = excluded.template_id,
       enabled = excluded.enabled,
       updated_at = excluded.updated_at`,
  )
    .bind(profile.id, profile.name, profile.collectionId, profile.target, profile.templateId, boolInt(profile.enabled), profile.createdAt, profile.updatedAt)
    .run();
  return profile;
}

export async function getProfile(env: SubStoreEnv, id: string) {
  const row = await env.DB.prepare("SELECT * FROM profiles WHERE id = ?").bind(id).first<ProfileRow>();
  return row ? profileFromRow(row) : undefined;
}

export async function deleteProfile(env: SubStoreEnv, id: string) {
  await ensureSchema(env);
  await env.DB.prepare("DELETE FROM profiles WHERE id = ?").bind(id).run();
  return { deleted: true };
}

export async function getStoredSubscriptions(env: SubStoreEnv): Promise<StoredSubscription[]> {
  const sources = await listSources(env);
  return sources.map((source) => ({
    id: source.id,
    name: source.id,
    displayName: source.name,
    source: source.type,
    type: source.type,
    url: source.url,
    content: source.content,
    filters: source.filters,
    process: source.filters,
    disabled: !source.enabled,
    enabled: source.enabled,
  }));
}

export async function getStoredCollection(env: SubStoreEnv, id: string): Promise<StoredCollection | undefined> {
  const collection = await getCollection(env, id);
  if (!collection || !collection.enabled) return undefined;
  return collectionToStored(collection);
}

export async function getRoutingTemplate(env: SubStoreEnv, id: string | undefined) {
  const template = await getTemplate(env, id || DEFAULT_TEMPLATE_ID);
  return template ? { id: template.id, name: template.name, target: template.target, config: template.config } : undefined;
}

async function seedDefaults(env: SubStoreEnv) {
  const now = Date.now();
  const template = await env.DB.prepare("SELECT id FROM templates WHERE id = ?").bind(DEFAULT_TEMPLATE_ID).first<{ id: string }>();
  if (!template) {
    await env.DB.prepare(
      "INSERT INTO templates (id, name, target, config_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(DEFAULT_TEMPLATE_ID, "Mihomo Basic", "mihomo", JSON.stringify(DEFAULT_TEMPLATE_CONFIG), now, now)
      .run();
  }

  const bootstrapContent = env.SUB_STORE_BOOTSTRAP_SOURCE_CONTENT || "";
  if (bootstrapContent) {
    const source = await env.DB.prepare("SELECT id FROM sources WHERE id = ?").bind(DEFAULT_SOURCE_ID).first<{ id: string }>();
    if (!source) {
      await env.DB.prepare(
        "INSERT INTO sources (id, name, type, url, content, enabled, filters_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          DEFAULT_SOURCE_ID,
          env.SUB_STORE_BOOTSTRAP_SOURCE_DISPLAY_NAME || "Bootstrap Source",
          "local",
          "",
          bootstrapContent,
          1,
          "[]",
          now,
          now,
        )
        .run();
    }
  }

  const collection = await env.DB.prepare("SELECT id FROM collections WHERE id = ?").bind(DEFAULT_COLLECTION_ID).first<{ id: string }>();
  if (!collection) {
    await env.DB.prepare(
      "INSERT INTO collections (id, name, source_ids_json, filters_json, template_id, ignore_failed, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(DEFAULT_COLLECTION_ID, "Daily", bootstrapContent ? JSON.stringify([DEFAULT_SOURCE_ID]) : "[]", "[]", DEFAULT_TEMPLATE_ID, 1, 1, now, now)
      .run();
  }

  const profile = await env.DB.prepare("SELECT id FROM profiles WHERE id = ?").bind(DEFAULT_PROFILE_ID).first<{ id: string }>();
  if (!profile) {
    await env.DB.prepare(
      "INSERT INTO profiles (id, name, collection_id, target, template_id, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(DEFAULT_PROFILE_ID, "Daily Mihomo", DEFAULT_COLLECTION_ID, "mihomo", DEFAULT_TEMPLATE_ID, 1, now, now)
      .run();
  }
}

function sourceFromRow(row: SourceRow): SourceRecord {
  return {
    id: row.id,
    name: row.name,
    type: row.type === "local" ? "local" : "remote",
    url: row.url,
    content: row.content,
    enabled: Boolean(row.enabled),
    filters: normalizeFilters(parseJson(row.filters_json, [])),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function collectionFromRow(row: CollectionRow): CollectionRecord {
  return {
    id: row.id,
    name: row.name,
    sourceIds: stringArray(parseJson(row.source_ids_json, [])),
    filters: normalizeFilters(parseJson(row.filters_json, [])),
    templateId: row.template_id,
    ignoreFailed: Boolean(row.ignore_failed),
    enabled: Boolean(row.enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function templateFromRow(row: TemplateRow): TemplateRecord {
  return {
    id: row.id,
    name: row.name,
    target: normalizeTargetValue(row.target),
    config: parseConfig(parseJson(row.config_json, DEFAULT_TEMPLATE_CONFIG)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function profileFromRow(row: ProfileRow): ProfileRecord {
  return {
    id: row.id,
    name: row.name,
    collectionId: row.collection_id,
    target: normalizeTargetValue(row.target),
    templateId: row.template_id,
    enabled: Boolean(row.enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function collectionToStored(collection: CollectionRecord): StoredCollection {
  return {
    id: collection.id,
    name: collection.id,
    displayName: collection.name,
    sourceIds: collection.sourceIds,
    subscriptions: collection.sourceIds,
    filters: collection.filters,
    process: collection.filters,
    templateId: collection.templateId,
    ignoreFailedRemoteSub: collection.ignoreFailed,
    enabled: collection.enabled,
  };
}

function normalizeFilters(value: unknown): FilterRule[] {
  return Array.isArray(value) ? (value.filter((item) => item && typeof item === "object") as FilterRule[]) : [];
}

function parseConfig(value: unknown) {
  return value && typeof value === "object" ? (value as JsonObject) : DEFAULT_TEMPLATE_CONFIG;
}

function parseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function normalizeTargetValue(value: unknown): SubscriptionTarget {
  const target = String(value || "mihomo").toLowerCase();
  if (target === "sing-box" || target === "v2ray" || target === "uri" || target === "json") return target;
  return "mihomo";
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function boolInt(value: boolean) {
  return value ? 1 : 0;
}

function toId(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "item";
}
