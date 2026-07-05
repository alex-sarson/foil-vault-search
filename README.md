# Foil Vault Search

A TypeScript Angular learning project for searching Magic: The Gathering cards via the [Scryfall API](https://scryfall.com/docs/api).

This repo is a **scaffold**, not a finished app. Services throw TODO errors, pages show placeholders, and most tests are skipped (`xit`) until you implement them.

## Quick start

```bash
npm install
npm start          # http://localhost:4200
npm test           # Jasmine + Karma (smoke tests only pass initially)
npm run build      # production build
```

## Routes

| Path | Description |
|------|-------------|
| `/search` | Card search (placeholder) |
| `/card/:id` | Card detail (shows route param) |
| `/syntax` | Scryfall syntax guide (skeleton) |

## Learning guides

- **[EXERCISES.md](./EXERCISES.md)** — Phased app implementation (HTTP → UI → routing → detail → syntax)
- **[EXERCISES-TESTING.md](./EXERCISES-TESTING.md)** — Parallel Jasmine/Karma testing track

## Project structure

```
src/app/
  core/           # Types, constants, stub services, interceptor
  features/       # search, card-detail, syntax-guide (lazy-loaded)
  shared/         # App shell (toolbar + nav)
  testing/        # Builders, helpers, fixture re-exports (for specs)
src/assets/fixtures/   # Sample Scryfall JSON for offline dev
```

## Tech stack

- Angular 19 (standalone components)
- Angular Material
- TypeScript strict mode
- Jasmine + Karma

## Scryfall attribution

Card data © Scryfall. This project is not affiliated with Wizards of the Coast.

See [EXERCISES.md](./EXERCISES.md) Phase 0 to begin.
