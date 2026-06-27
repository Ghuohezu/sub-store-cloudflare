# Sub-Store Cloudflare

一个极简的 Cloudflare Worker 订阅聚合器。它把订阅源、组合订阅、节点筛选和分流规则模板放在云端配置，客户端只需要订阅最终输出链接。

[English README](README.en.md)

## 这是什么

Sub-Store Cloudflare 的默认形态是一个 Worker 应用：

- 内置轻量管理页，不需要单独部署前端。
- 用 D1 保存订阅源、组合订阅、规则模板和输出链接。
- 用 Worker Secrets 管理管理端 token 和下载 token。
- 支持输出 Mihomo、sing-box、v2ray、URI 和 JSON。
- 规则模板、过滤规则和组合订阅都保存在 D1，不和代码耦合。

致敬原版 [sub-store-org/Sub-Store](https://github.com/sub-store-org/Sub-Store)。原版 Sub-Store 做了大量协议解析、订阅管理和客户端生态兼容工作；这个仓库聚焦 Cloudflare 上的轻量云端聚合与规则配置。

## 核心概念

| 概念 | 作用 |
| --- | --- |
| Sources | 远程订阅 URL 或本地节点文本。 |
| Collections | 把多个 Sources 聚合成一个云端组合订阅。 |
| Filters | 对节点做保留、排除、重命名、去重和排序。 |
| Templates | 配置 Mihomo 的 `proxy-groups`、`rule-providers` 和 `rules`。 |
| Profiles | 把 Collection、目标格式和 Template 绑定成最终下载链接。 |

核心价值是把客户端里的复杂配置前移到云端：多个订阅和节点在 Worker 里聚合，分流规则在 D1 里维护，客户端只保留一个订阅 URL。

## 项目地图

```text
.
├── cloudflare/              # 默认部署入口：Worker + D1 + 内置管理页
├── docs/                     # 架构和部署说明
└── scripts/                  # 维护脚本
```

首次部署只需要关注 `cloudflare/`。

## 快速开始

需要：

- Node.js 20+
- pnpm
- Cloudflare 账号

安装依赖：

```bash
pnpm run setup
```

创建 D1 数据库，并把返回的 `database_id` 填到 [cloudflare/wrangler.jsonc](cloudflare/wrangler.jsonc)：

```bash
pnpm --dir cloudflare exec wrangler d1 create sub-store-cloudflare
```

本地开发：

```bash
cp cloudflare/.dev.vars.example cloudflare/.dev.vars
pnpm run dev
```

`SUB_STORE_ADMIN_TOKEN` 和 `SUB_STORE_PUBLIC_DOWNLOAD_TOKEN` 都需要配置。前者用于管理页和 API，后者用于客户端订阅下载。

## 部署

设置管理端和下载端 token：

```bash
pnpm --dir cloudflare exec wrangler secret put SUB_STORE_ADMIN_TOKEN
pnpm --dir cloudflare exec wrangler secret put SUB_STORE_PUBLIC_DOWNLOAD_TOKEN
```

应用 D1 迁移：

```bash
pnpm --dir cloudflare run migrate:remote
```

部署：

```bash
pnpm run deploy:dry-run
pnpm run deploy
```

默认会部署到 `workers.dev`。如果要绑定自己的域名，再在 [cloudflare/wrangler.jsonc](cloudflare/wrangler.jsonc) 中添加 `routes` 或 `custom_domain` 配置。

部署后访问管理页：

```text
https://substore.example.com/?token=<admin-token>
```

客户端下载链接形如：

```text
https://substore.example.com/download/<profile>/mihomo?token=<download-token>
https://substore.example.com/download/<profile>/sing-box?token=<download-token>
```

更完整步骤见 [docs/deployment.md](docs/deployment.md)。

## 配置模型

过滤器示例：

```json
[
  { "type": "include", "field": "name", "pattern": "香港|HK|Japan|JP" },
  { "type": "exclude", "field": "name", "pattern": "倍率|剩余|官网" },
  { "type": "dedupe", "fields": ["server", "port"] },
  { "type": "sort", "direction": "asc" }
]
```

模板示例：

```json
{
  "proxyGroups": [
    { "name": "🚀 节点选择", "type": "select", "proxies": ["♻️ 自动选择", "DIRECT"] },
    { "name": "♻️ 自动选择", "type": "url-test", "proxies": ["$all"], "url": "https://www.gstatic.com/generate_204", "interval": 300 }
  ],
  "rules": [
    "DOMAIN-SUFFIX,openai.com,🚀 节点选择",
    "GEOIP,CN,DIRECT",
    "MATCH,🚀 节点选择"
  ]
}
```

`$all` 会在生成时展开成当前组合订阅里的全部节点。

## 许可证

见 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)。若从 [sub-store-org/Sub-Store](https://github.com/sub-store-org/Sub-Store) 复制或移植代码，请保留原项目许可证声明。

## 致谢

感谢 [sub-store-org/Sub-Store](https://github.com/sub-store-org/Sub-Store) 和所有原项目贡献者。
