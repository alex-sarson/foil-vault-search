# Local Scryfall mirror API

Fastify + SQLite service that shreds Scryfall **oracle-cards** bulk data and serves Scryfall-shaped endpoints.

## Endpoints

| Path | Notes |
|------|--------|
| `GET /health` | Ready after DB is loaded |
| `GET /cards/search?q=&page=` | Page size 175; empty → 404 error body |
| `GET /cards/:id` | Card by Scryfall UUID |

## Boot

1. Reuse `data/cards.db` if it already has cards
2. Else restore from `../../data/cards.sql` or `./data/cards.sql`
3. Else download oracle-cards JSONL, shred into normalized tables, write dump

## Search coverage

Supported (approximate Scryfall parity): colors / identity, types, oracle text, mana / CMC, rarity, set, format legality, prices (`usd`/`eur`/`tix`), boolean `OR` / negation (`-`), quoted phrases, bare-word FTS on name.

Known gaps: full criteria nesting, `is:` / `not:` / `unique:` semantics beyond page params, most `++` / date / game-specific ops, and uncommon comparison edge cases. Prefer simple Phase-6-style queries.

Card images still come from `*.scryfall.io` on the client.
