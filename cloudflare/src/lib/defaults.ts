import type { RoutingTemplateConfig } from "../types";

export const DEFAULT_SOURCE_ID = "demo-source";
export const DEFAULT_COLLECTION_ID = "daily";
export const DEFAULT_TEMPLATE_ID = "mihomo-basic";
export const DEFAULT_PROFILE_ID = "daily-mihomo";

export const DEFAULT_TEMPLATE_CONFIG: RoutingTemplateConfig = {
  mixedPort: 7890,
  allowLan: false,
  mode: "rule",
  logLevel: "info",
  dns: {
    enable: true,
    ipv6: false,
    "enhanced-mode": "fake-ip",
    nameserver: ["https://doh.pub/dns-query", "https://dns.alidns.com/dns-query"],
  },
  proxyGroups: [
    { name: "🚀 节点选择", type: "select", proxies: ["♻️ 自动选择", "🚀 手动切换", "DIRECT"] },
    { name: "♻️ 自动选择", type: "url-test", proxies: ["$all"], url: "https://www.gstatic.com/generate_204", interval: 300, tolerance: 50 },
    { name: "🚀 手动切换", type: "select", proxies: ["$all"] },
    { name: "💬 AI 服务", type: "select", proxies: ["🚀 节点选择", "♻️ 自动选择", "DIRECT"] },
    { name: "🎬 流媒体", type: "select", proxies: ["🚀 节点选择", "♻️ 自动选择", "DIRECT"] },
    { name: "🎯 全球直连", type: "select", proxies: ["DIRECT", "🚀 节点选择"] },
    { name: "🐟 漏网之鱼", type: "select", proxies: ["🚀 节点选择", "DIRECT"] },
  ],
  ruleProviders: {},
  rules: [
    "DOMAIN-SUFFIX,openai.com,💬 AI 服务",
    "DOMAIN-SUFFIX,chatgpt.com,💬 AI 服务",
    "DOMAIN-SUFFIX,anthropic.com,💬 AI 服务",
    "DOMAIN-SUFFIX,claude.ai,💬 AI 服务",
    "DOMAIN-SUFFIX,netflix.com,🎬 流媒体",
    "DOMAIN-SUFFIX,youtube.com,🎬 流媒体",
    "DOMAIN-SUFFIX,googlevideo.com,🎬 流媒体",
    "GEOIP,CN,🎯 全球直连",
    "MATCH,🐟 漏网之鱼",
  ],
};
