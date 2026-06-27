export type SubStoreEnv = {
  DB: D1Database;
  SUB_STORE_APP_NAME?: string;
  SUB_STORE_ADMIN_TOKEN?: string;
  SUB_STORE_PUBLIC_DOWNLOAD_HOSTS?: string;
  SUB_STORE_PUBLIC_DOWNLOAD_TOKEN?: string;
  SUB_STORE_BOOTSTRAP_SOURCE_NAME?: string;
  SUB_STORE_BOOTSTRAP_SOURCE_DISPLAY_NAME?: string;
  SUB_STORE_BOOTSTRAP_SOURCE_CONTENT?: string;
};

export type FilterRule = {
  type: "include" | "exclude" | "rename" | "dedupe" | "sort" | string;
  field?: string;
  fields?: string[];
  pattern?: string;
  replacement?: string;
  direction?: "asc" | "desc";
  [key: string]: unknown;
};

export type StoredSubscription = {
  id?: string;
  name: string;
  displayName?: string;
  source?: "remote" | "local";
  type?: "remote" | "local";
  url?: string;
  content?: string;
  process?: FilterRule[] | unknown[];
  filters?: FilterRule[];
  enabled?: boolean;
  disabled?: boolean;
  tag?: string[];
  [key: string]: unknown;
};

export type StoredCollection = {
  id?: string;
  name: string;
  displayName?: string;
  subscriptions?: string[];
  sourceIds?: string[];
  process?: FilterRule[] | unknown[];
  filters?: FilterRule[];
  templateId?: string;
  ignoreFailedRemoteSub?: boolean;
  enabled?: boolean;
  [key: string]: unknown;
};

export type RoutingTemplate = {
  id?: string;
  name?: string;
  target?: SubscriptionTarget;
  config: RoutingTemplateConfig;
};

export type RoutingTemplateConfig = {
  mixedPort?: number;
  allowLan?: boolean;
  mode?: string;
  logLevel?: string;
  dns?: Record<string, unknown>;
  sniffer?: Record<string, unknown>;
  proxyGroups?: TemplateProxyGroup[];
  ruleProviders?: Record<string, unknown>;
  rules?: string[];
};

export type TemplateProxyGroup = {
  name: string;
  type: "select" | "url-test" | "fallback" | "load-balance" | string;
  proxies?: string[];
  filter?: string;
  url?: string;
  interval?: number;
  tolerance?: number;
  [key: string]: unknown;
};

export type SubscriptionTarget = "mihomo" | "sing-box" | "v2ray" | "uri" | "json";

export type SourceRecord = {
  id: string;
  name: string;
  type: "remote" | "local";
  url: string;
  content: string;
  enabled: boolean;
  filters: FilterRule[];
  createdAt: number;
  updatedAt: number;
};

export type CollectionRecord = {
  id: string;
  name: string;
  sourceIds: string[];
  filters: FilterRule[];
  templateId: string;
  ignoreFailed: boolean;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TemplateRecord = {
  id: string;
  name: string;
  target: SubscriptionTarget;
  config: RoutingTemplateConfig;
  createdAt: number;
  updatedAt: number;
};

export type ProfileRecord = {
  id: string;
  name: string;
  collectionId: string;
  target: SubscriptionTarget;
  templateId: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

export type AppConfig = {
  sources: SourceRecord[];
  collections: CollectionRecord[];
  templates: TemplateRecord[];
  profiles: ProfileRecord[];
};
