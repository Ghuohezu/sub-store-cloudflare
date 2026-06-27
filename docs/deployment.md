# 部署说明

默认部署入口是 [cloudflare/](../cloudflare)。这是一个 Worker + D1 应用，管理页由 Worker 内置返回。

## 1. 准备环境

需要：

- Node.js 20+
- pnpm
- Cloudflare 账号

安装依赖：

```bash
pnpm run setup
```

## 2. 创建 D1 数据库

```bash
pnpm --dir cloudflare exec wrangler d1 create sub-store-cloudflare
```

把命令返回的 `database_id` 填入 [cloudflare/wrangler.jsonc](../cloudflare/wrangler.jsonc)。

## 3. 本地开发

```bash
cp cloudflare/.dev.vars.example cloudflare/.dev.vars
pnpm run dev
```

本地 `.dev.vars` 至少可以包含：

```dotenv
SUB_STORE_ADMIN_TOKEN=dev-admin-token
SUB_STORE_PUBLIC_DOWNLOAD_TOKEN=dev-download-token
```

管理端和下载端使用两个 token。管理 token 用在管理页和 `/api/*`，下载 token 用在 `/download/*`。

## 4. 生产 Secrets

```bash
pnpm --dir cloudflare exec wrangler secret put SUB_STORE_ADMIN_TOKEN
pnpm --dir cloudflare exec wrangler secret put SUB_STORE_PUBLIC_DOWNLOAD_TOKEN
```

可选：用 Secret 写入一份初始本地订阅文本：

```bash
pnpm --dir cloudflare exec wrangler secret put SUB_STORE_BOOTSTRAP_SOURCE_CONTENT
```

部署后也可以直接在管理页添加订阅源。

## 5. 应用迁移

```bash
pnpm --dir cloudflare run migrate:remote
```

本地 D1 迁移：

```bash
pnpm --dir cloudflare run migrate:local
```

## 6. 部署

```bash
pnpm run deploy:dry-run
pnpm run deploy
```

默认配置会部署到 `workers.dev`。如果要绑定自己的域名，可以在 [cloudflare/wrangler.jsonc](../cloudflare/wrangler.jsonc) 中增加：

```jsonc
{
  "routes": [
    { "pattern": "substore.example.com", "custom_domain": true }
  ]
}
```

如果希望管理域名和下载域名分开，把下载域名写入 `SUB_STORE_PUBLIC_DOWNLOAD_HOSTS`。这些域名只开放 `/download/*`。

## 7. 使用

管理页：

```text
https://substore.example.com/?token=<admin-token>
```

下载链接：

```text
https://substore.example.com/download/<profile>/mihomo?token=<download-token>
https://substore.example.com/download/<profile>/sing-box?token=<download-token>
https://substore.example.com/download/<profile>/uri?token=<download-token>
```
