# 架构说明

Sub-Store Cloudflare 的默认架构已经收敛成一个 Worker 和一个 D1 数据库。它不再默认使用独立前端、Durable Object、KV、R2、Queue 或 Cron。

## 运行边界

```text
Cloudflare Worker
  |
  |-- GET /                     内置管理页
  |-- /api/*                    配置 API
  |-- /download/:profile        客户端订阅输出
  |
  |-- D1                        sources / collections / templates / profiles
  |-- Worker Secrets            管理端 token / 下载 token
```

## 数据模型

| 表 | 作用 |
| --- | --- |
| `sources` | 保存远程订阅 URL 或本地节点文本。 |
| `collections` | 保存订阅源组合、过滤器和默认模板。 |
| `templates` | 保存规则模板，包括代理组、规则提供者和规则列表。 |
| `profiles` | 保存最终输出入口，绑定 collection、target 和 template。 |

## 输出流程

```text
客户端请求 /download/:profile
  |
  |-- 校验下载 token
  |-- 读取 profile
  |-- 读取 collection
  |-- 拉取 collection 里的 sources
  |-- 解析节点
  |-- 应用 source filters
  |-- 合并、去重
  |-- 应用 collection filters
  |-- 套用 template
  |-- 输出 mihomo / sing-box / v2ray / uri / json
```

## Filters

过滤器是 JSON 配置，保存在 D1：

- `include`：按字段和正则保留节点。
- `exclude`：按字段和正则排除节点。
- `rename`：按正则重命名字段，默认字段是 `name`。
- `dedupe`：按一个或多个字段去重。
- `sort`：按节点名排序。

示例：

```json
[
  { "type": "include", "field": "name", "pattern": "香港|HK|日本|JP" },
  { "type": "exclude", "field": "name", "pattern": "官网|剩余|倍率" },
  { "type": "dedupe", "fields": ["server", "port"] },
  { "type": "sort", "direction": "asc" }
]
```

## Templates

模板也是 JSON 配置，保存在 D1。Mihomo 模板支持：

- `mixedPort`
- `allowLan`
- `mode`
- `logLevel`
- `dns`
- `sniffer`
- `proxyGroups`
- `ruleProviders`
- `rules`

`proxyGroups[].proxies` 里可以使用 `$all`，生成时会展开为当前组合订阅里的所有节点。

## 为什么只用 D1

这个项目的数据是结构化配置，不是大文件、后台任务或边缘缓存。D1 能直接表达 sources、collections、templates 和 profiles，也方便导入导出。KV、R2、Queue 和 Cron 都不是核心路径。

## 上游关系

这个仓库不默认内置原版 Sub-Store 源码。需要对照完整实现时，直接参考 [sub-store-org/Sub-Store](https://github.com/sub-store-org/Sub-Store)。
