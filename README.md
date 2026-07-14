# Foil Vault Search

A TypeScript Angular learning project for searching Magic: The Gathering cards via a **local Scryfall data mirror** (SQLite + Fastify), so the browser never hits `api.scryfall.com` rate limits.

This repo is a **scaffold**, not a finished app. Services may still show TODOs, pages show placeholders, and most tests are skipped (`xit`) until you implement them.

## Quick start

```bash
pnpm install
pnpm start          # API :3000 + Angular :4200 (waits for /health)
pnpm test           # Jasmine + Karma (web package)
pnpm run build      # API typecheck + web production build
```

First boot downloads Scryfall **oracle-cards** bulk data and shreds it into SQLite (`apps/api/data/cards.db`). That can take several minutes. Later boots reuse the DB. To skip the download, place a dump at `data/cards.sql` (see [data/README.md](./data/README.md)).

| Script | What it does |
|--------|----------------|
| `pnpm start` | Local API + Angular together |
| `pnpm start:api` | API only |
| `pnpm start:web` | Angular only (needs API already up) |
| `pnpm ingest` | Force DB ensure / download+shred if empty |

## Monorepo layout

```
apps/
  web/            # Angular 19 app (Material, Jasmine/Karma)
  api/            # Fastify + SQLite Scryfall-shaped mirror
data/             # Optional cards.sql dump for fast first boot
```

## Routes (web)

| Path | Description |
|------|-------------|
| `/search` | Card search (placeholder until you implement) |
| `/card/:id` | Card detail |
| `/syntax` | Scryfall syntax guide (skeleton) |

Web calls `http://localhost:3000` (`SCRYFALL_API_BASE_URL`) with the same paths as Scryfall (`/cards/search`, `/cards/:id`). Card **images** still load from `*.scryfall.io`.

## Learning guides

- **[EXERCISES.md](./EXERCISES.md)** — Phased app implementation (HTTP → UI → routing → detail → syntax)
- **[EXERCISES-TESTING.md](./EXERCISES-TESTING.md)** — Parallel Jasmine/Karma testing track
- **[apps/api/README.md](./apps/api/README.md)** — Local mirror search coverage and boot order

## Tech stack

- pnpm workspaces
- Angular 19 (standalone components) + Angular Material
- Fastify + better-sqlite3
- TypeScript strict mode
- Jasmine + Karma

## Scryfall attribution

Card data © Scryfall. This project is not affiliated with Wizards of the Coast.

See [EXERCISES.md](./EXERCISES.md) Phase 0 to begin.
