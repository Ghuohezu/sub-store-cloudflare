# Sub-Store Cloudflare

A minimal Cloudflare Worker subscription aggregator. It keeps subscription sources, collections, node filters, routing templates, and generated client profiles in the cloud, so clients only need one final subscription URL.

Chinese is the primary documentation language for this repository. See [README.md](README.md).

## What This Is

The default deployment is a single Worker application:

- Built-in management UI.
- D1 for sources, collections, templates, and profiles.
- Worker Secrets for admin and download tokens.
- Outputs for Mihomo, sing-box, v2ray, URI, and JSON.
- Routing templates and filters are stored in D1 instead of being coupled to code.

Thanks to [sub-store-org/Sub-Store](https://github.com/sub-store-org/Sub-Store). This repository focuses on a smaller Cloudflare-native deployment model.

## Layout

```text
.
├── cloudflare/              # Default Worker + D1 application
├── docs/                     # Architecture and deployment guides
└── scripts/                  # Maintenance scripts
```

## Quick Start

```bash
pnpm run setup
pnpm --dir cloudflare exec wrangler d1 create sub-store-cloudflare
cp cloudflare/.dev.vars.example cloudflare/.dev.vars
pnpm run dev
```

`SUB_STORE_ADMIN_TOKEN` protects the management UI and API. `SUB_STORE_PUBLIC_DOWNLOAD_TOKEN` protects generated subscription downloads.

Set production secrets:

```bash
pnpm --dir cloudflare exec wrangler secret put SUB_STORE_ADMIN_TOKEN
pnpm --dir cloudflare exec wrangler secret put SUB_STORE_PUBLIC_DOWNLOAD_TOKEN
```

Deploy:

```bash
pnpm --dir cloudflare run migrate:remote
pnpm run deploy
```

## Acknowledgements

Thanks to [sub-store-org/Sub-Store](https://github.com/sub-store-org/Sub-Store) and its contributors.

See [LICENSE](LICENSE) and [NOTICE](NOTICE) for licensing and attribution notes.
