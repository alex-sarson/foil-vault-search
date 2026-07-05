# Foil Vault Search — Implementation Exercises

A phased learning path for building a Scryfall card search app in Angular. Complete phases in order; each builds on the last.

**Parallel track:** See [EXERCISES-TESTING.md](./EXERCISES-TESTING.md) for Jasmine/Karma tests to un-skip as you go.

---

## Phase 0 — Orientation

**Goal:** Run the app, explore the scaffold, find TODO markers.

**Files to explore:**
- `src/app/core/models/scryfall.types.ts` — complete Scryfall interfaces
- `src/app/features/` — placeholder pages and components
- `src/assets/fixtures/` — sample JSON for offline UI work

**Steps:**
1. Run `npm start` (or `ng serve`) and open http://localhost:4200
2. Click **Search** and **Syntax Guide** in the toolbar — all routes should load
3. Visit `/card/any-uuid-here` — the route param should appear on the page
4. Search the codebase for `TODO(learn)` comments

**Verify:** App compiles, three routes navigate, no console errors on load.

**Docs:** [Angular standalone components](https://angular.dev/guide/components), [Scryfall API](https://scryfall.com/docs/api)

---

## Phase 1 — First HTTP call

**Goal:** Implement `getCardById()` and see real card JSON.

**Files to edit:**
- `src/app/core/services/scryfall-api.service.ts`
- `src/app/features/card-detail/card-detail.page.ts` (temporary console.log)

**Hints:**
- Use `inject(HttpClient)` (already wired)
- Base URL: `SCRYFALL_API_BASE_URL` from `scryfall.constants.ts`
- `GET ${base}/cards/${id}` returns `Observable<ScryfallCard>`
- Call the service from `CardDetailPage` using the route `:id` param

**Verify:** Navigate to a real card UUID (from a fixture or Scryfall) — response logged to console.

**Docs:** [Scryfall GET /cards/:id](https://scryfall.com/docs/api/cards/id), [Angular HttpClient](https://angular.dev/guide/http)

---

## Phase 2 — Search API

**Goal:** Implement `searchCards()` with query encoding and error handling.

**Files to edit:**
- `src/app/core/services/scryfall-api.service.ts`

**Hints:**
- Endpoint: `GET /cards/search?q=&page=`
- Encode `q` with `encodeURIComponent`
- Zero results returns HTTP 404 with `{ object: 'error', ... }` — not an empty list
- Optional: pass `order` and `unique` from `SearchOptions`

**Verify:** Call `searchCards('lightning')` from console or a temporary button — see card list JSON.

**Docs:** [Scryfall search](https://scryfall.com/docs/api/cards/search)

---

## Phase 3 — Search UI

**Goal:** Build search bar, card grid, and card tile with fixture data first.

**Files to edit:**
- `src/app/features/search/components/search-bar/search-bar.component.ts`
- `src/app/features/search/components/card-grid/card-grid.component.ts`
- `src/app/features/search/components/card-tile/card-tile.component.ts`
- `src/app/features/search/search.page.ts`

**Hints:**
- Import fixture: `src/assets/fixtures/search-response.sample.json`
- Wire `SearchBarComponent.searchQuery` output → parent handler
- Use `@for (card of cards(); track card.id)` in grid
- Show `image_uris.small` with `loading="lazy"` on tiles
- Swap fixture for live API when UI works

**Verify:** Typing a query shows card tiles (fixture or live).

**Docs:** [Angular signals](https://angular.dev/guide/signals), [Material form field](https://material.angular.io/components/form-field)

---

## Phase 4 — Routing and URL state

**Goal:** Sync search query and page to URL; navigate to card detail.

**Files to edit:**
- `src/app/features/search/search.page.ts`

**Hints:**
- Read/write `q` and `page` via `ActivatedRoute` query params
- Use `Router.navigate` with `queryParamsHandling: 'merge'`
- On tile click: `router.navigate(['/card', card.id], { state: { card } })`
- Deep link `/card/:id` without state → API fallback in detail page

**Verify:** Refresh preserves search; back button returns to search; `/card/:id` works without prior navigation.

**Docs:** [Router query params](https://angular.dev/guide/routing/read-route-state)

---

## Phase 5 — Card detail UI

**Goal:** Full detail page with presentational child components.

**Files to edit:**
- `src/app/features/card-detail/card-detail.page.ts`
- `src/app/features/card-detail/components/card-image/`
- `src/app/features/card-detail/components/card-faces/`
- `src/app/features/card-detail/components/card-legalities/`

**Hints:**
- Load order: router state → `CardCacheService` → `getCardById()`
- Use `card-detail.sample.json` for DFC layout testing
- `layout: 'transform'` cards use `card_faces[]` instead of top-level `image_uris`
- Link to `scryfall_uri` for external view

**Verify:** Single- and double-faced cards render; legalities table shows formats.

---

## Phase 6 — Syntax guide

**Goal:** Populate guide content and wire Try-it navigation.

**Files to edit:**
- `src/app/features/syntax-guide/syntax-sections.data.ts`
- `src/app/features/syntax-guide/syntax-guide.page.ts`

**Hints:**
- Add `description` and `examples: [{ label, query }]` per section
- Try it: `[routerLink]="['/search']" [queryParams]="{ q: example.query }"`
- Reference [Scryfall syntax docs](https://scryfall.com/docs/syntax)

**Verify:** Each section has content; Try it opens search with pre-filled query.

---

## Stretch goals (optional)

| Goal | Files | Notes |
|------|-------|-------|
| Debounce + rate limit | `search-bar`, `search-rate-limiter.service.ts` | 300ms debounce, 500ms between API calls |
| LRU cache | `card-cache.service.ts` | Cache detail lookups |
| OnPush | All feature components | `changeDetection: ChangeDetectionStrategy.OnPush` |
| Loading skeletons | Search + detail pages | `mat-progress-bar` or skeleton placeholders |
| Error retry | Search page | Retry button on ScryfallError |

---

## Scryfall API quick reference

| Endpoint | Rate limit | Notes |
|----------|------------|-------|
| `GET /cards/search?q=&page=` | ~2/sec | 175 cards/page; encode `q` |
| `GET /cards/:id` | ~10/sec | UUID from search results |
| Images on `*.scryfall.io` | none | Use `image_uris.small` / `normal` |

---

## Conventions in this repo

- `// TODO(learn):` — your implementation task
- `// HINT:` — suggested approach
- `// EXAMPLE (disabled):` — copy-paste starter inside `@if (false)` blocks
- Services throw `'TODO: …'` until implemented
