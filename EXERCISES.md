# Foil Vault Search — Implementation Exercises

A phased learning path for building a Scryfall card search app in Angular. Complete phases in order; each builds on the last.

**Parallel track:** See [EXERCISES-TESTING.md](./EXERCISES-TESTING.md) for Jasmine/Karma tests to un-skip as you go.

**Audience:** Comfortable with TypeScript, JavaScript, and React — new to Angular. You do not need prior RxJS, DI, or template syntax experience; each phase introduces only what you need for that step.

---

## React → Angular cheat sheet

Use this when something feels unfamiliar. You already know the concepts — Angular names them differently.

| You know (React) | Angular equivalent | Where you'll see it |
|------------------|-------------------|---------------------|
| `function App()` component | `@Component({ ... }) class` | Every `.component.ts` / `.page.ts` |
| `props` | `@Input()` or `input()` (signals) | Child components |
| `onSearch={fn}` callback props | `@Output()` or `output()` + `.emit()` | Search bar → parent |
| `useContext` / prop drilling | **Dependency injection** — `inject(Service)` | Services, route, HTTP |
| Custom hook (`useSearchCards`) | **Injectable service** (`@Injectable`) | `ScryfallApiService` |
| `fetch` / `axios` | **`HttpClient`** (returns `Observable`, not `Promise`) | `scryfall-api.service.ts` |
| `useEffect(() => { fetch... }, [id])` | **`ngOnInit()`** + `.subscribe()` | `card-detail.page.ts` |
| React Router `<Route path="/card/:id">` | **`Router` + route config** in `app.routes.ts` | Lazy-loaded feature routes |
| `useParams()` / `useSearchParams()` | **`ActivatedRoute`** — `paramMap`, `queryParamMap` | Search + detail pages |
| `useNavigate()` | **`Router.navigate()`** | Tile click → detail |
| `location.state` on navigate | **`Router.navigate(..., { state: { card } })`** | Pass card without re-fetch |
| JSX `{items.map(...)}` | **`@for (item of items(); track item.id)`** | Templates (`.html` or inline) |
| `@/` imports | **`@/` not used** — relative imports from `src/app/` | All feature files |
| Vite / CRA dev server | **`ng serve`** (`npm start`) | `package.json` scripts |
| Jest + React Testing Library | **Jasmine + Karma + TestBed** | `*.spec.ts` files |

**RxJS in one paragraph:** Angular HTTP returns `Observable<T>` instead of `Promise<T>`. For now, treat `.subscribe({ next, error })` like `.then()` / `.catch()`. You call the service, subscribe in the component, and assign or log the result. Deeper operators (`switchMap`, `debounceTime`) appear in later phases.

**DI in one paragraph:** Instead of importing a hook, you declare `private readonly api = inject(ScryfallApiService)` inside a class. Angular's injector creates or reuses the service instance. In tests, you override providers to inject mocks — see [EXERCISES-TESTING.md](./EXERCISES-TESTING.md) T1b.

---

## How the two tracks fit together

Each app phase adds behavior; the matching test phase proves it. Work in this order:

1. Complete the **app phase** (implement the feature).
2. Complete the **test phase** with the same number (un-skip and write the spec).
3. Run **`npm test`** — fix any collateral breakage before moving on (see testing doc **T1b** after App Phase 1).

If tests fail after an app change, that is normal in Angular: components that start calling services need matching test setup. The testing guide calls out when to expect this.

---

## Phase 0 — Orientation

**Goal:** Run the app, explore the scaffold, find TODO markers.

**Files to explore:**
- `src/app/app.routes.ts` — like a React Router route table; features are lazy-loaded
- `src/app/app.config.ts` — app-wide providers (`provideHttpClient`, router, etc.) — similar to wrapping `<App>` with context providers
- `src/app/core/models/scryfall.types.ts` — complete Scryfall interfaces (plain TypeScript)
- `src/app/features/` — placeholder pages and components (one folder per route/feature)
- `src/assets/fixtures/` — sample JSON for offline UI work

**Steps:**
1. Run `npm start` (or `ng serve`) and open http://localhost:4200
2. Click **Search** and **Syntax Guide** in the toolbar — all routes should load
3. Visit `/card/any-uuid-here` — the route param should appear on the page subtitle
4. Search the codebase for `TODO(learn)` comments
5. Skim one component file (e.g. `search.page.ts`) — note the `@Component` decorator, `imports: [...]`, and inline `template:` string instead of a separate JSX file

**Verify:** App compiles, three routes navigate, no console errors on load.

**Angular gotcha:** Standalone components (this project) list their own `imports` — there is no single `App.tsx` that imports everything. Each component declares what it needs (Material modules, child components).

**Docs:** [Angular standalone components](https://angular.dev/guide/components), [Scryfall API](https://scryfall.com/docs/api)

---

## Phase 1 — First HTTP call

**Goal:** Implement `getCardById()` and see real card JSON.

**Files to edit:**
- `src/app/core/services/scryfall-api.service.ts`
- `src/app/features/card-detail/card-detail.page.ts` (temporary `console.log`)

**Step-by-step:**

1. **Service only first** — In `scryfall-api.service.ts`, replace the `throwError` stub in `getCardById` with:
   ```ts
   return this.http.get<ScryfallCard>(`${SCRYFALL_API_BASE_URL}/cards/${id}`);
   ```
   `HttpClient` is already injected via `inject(HttpClient)`. `SCRYFALL_API_BASE_URL` is in `scryfall.constants.ts`.

2. **Wire the page** — In `card-detail.page.ts`:
   - Add `inject(ScryfallApiService)` (same pattern as `inject(ActivatedRoute)`)
   - Implement `OnInit` and call `getCardById(this.cardId).subscribe(...)` in `ngOnInit`
   - Log the response with `console.log` for now — UI comes in Phase 5

3. **Manual verify** — Visit `/card/91fdb56b-54d5-4272-8319-505ff987fe9b` (Sol Ring) and check the browser console for card JSON.

**React comparison:** `ScryfallApiService` ≈ a module exporting `fetchCardById`. `ngOnInit` ≈ `useEffect(() => { fetchCardById(id).then(setCard) }, [id])`. Route param `cardId` is already on the class from `ActivatedRoute`.

**Verify:** Navigate to a real card UUID — response logged to console.

**Then do testing T1 + T1b** before Phase 2. After wiring the page, `CardDetailPage` smoke tests will fail without a mock service — T1b fixes that in ~10 lines. Do not un-skip the other `CardDetailPage` specs yet (those are T5).

**Docs:** [Scryfall GET /cards/:id](https://scryfall.com/docs/api/cards/id), [Angular HttpClient](https://angular.dev/guide/http)

---

## Phase 2 — Search API

**Goal:** Implement `searchCards()` with query encoding and error handling.

**Files to edit:**
- `src/app/core/services/scryfall-api.service.ts`

**Hints:**
- Endpoint: `GET /cards/search?q=&page=`
- Build the URL with `encodeURIComponent(query)` — same as React; never interpolate raw user input
- Zero results returns HTTP **404** with `{ object: 'error', ... }` — not an empty list
- Optional: pass `order` and `unique` from `SearchOptions`
- Return type: `Observable<ScryfallList<ScryfallCard>>`

**Verify:** Call `searchCards('lightning')` from console or a temporary button — see card list JSON.

**Then do testing T2.**

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
- Wire `SearchBarComponent` `searchQuery` output → parent handler (like `onSearch={handleSearch}`)
- Parent holds card list state — use a `signal<ScryfallCard[]>([])` or plain property + change detection
- Use `@for (card of cards(); track card.id)` in the grid template (like `.map()` in JSX)
- Show `image_uris.small` with `loading="lazy"` on tiles
- Swap fixture for live API when UI works

**React comparison:** `input()` / `output()` on child components ≈ typed props + callback props. The page component is the smart container; bar/grid/tile are presentational.

**Verify:** Typing a query shows card tiles (fixture or live).

**Then do testing T3.**

**Docs:** [Angular signals](https://angular.dev/guide/signals), [Material form field](https://material.angular.io/components/form-field)

---

## Phase 4 — Routing and URL state

**Goal:** Sync search query and page to URL; navigate to card detail.

**Files to edit:**
- `src/app/features/search/search.page.ts`

**Hints:**
- Read/write `q` and `page` via `ActivatedRoute` query params (`queryParamMap` / `queryParams`)
- Use `Router.navigate` with `queryParamsHandling: 'merge'` — like updating search params without dropping others
- On tile click: `router.navigate(['/card', card.id], { state: { card } })`
- Deep link `/card/:id` without state → API fallback in detail page (Phase 5)

**React comparison:** `ActivatedRoute` ≈ `useSearchParams()` + `useParams()`. `router.navigate` ≈ `navigate('/card/' + id, { state: { card } })`.

**Verify:** Refresh preserves search; back button returns to search; `/card/:id` works without prior navigation.

**Then do testing T4.**

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
- Load order: router `history.state` → `CardCacheService` → `getCardById()`
- Use `card-detail.sample.json` for DFC layout testing
- `layout: 'transform'` cards use `card_faces[]` instead of top-level `image_uris`
- Pass data to children via `@Input()` / `input()` — same idea as React props
- Link to `scryfall_uri` for external view

**Verify:** Single- and double-faced cards render; legalities table shows formats.

**Then do testing T5** (un-skip the remaining `CardDetailPage` specs).

---

## Phase 6 — Syntax guide

**Goal:** Populate guide content and wire Try-it navigation.

**Files to edit:**
- `src/app/features/syntax-guide/syntax-sections.data.ts`
- `src/app/features/syntax-guide/syntax-guide.page.ts`

**Hints:**
- Add `description` and `examples: [{ label, query }]` per section
- Try it: `[routerLink]="['/search']" [queryParams]="{ q: example.query }"` — declarative navigation in the template
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

**Then do testing T6** if you implement stretch features.

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

---

## Troubleshooting (common for React devs)

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `NullInjectorError: No provider for HttpClient` in tests | Component uses a service that needs HTTP; test `TestBed` has no HTTP providers | Mock the service (T1b) or add `provideHttpClient()` + `provideHttpClientTesting()` |
| `NullInjectorError: No provider for X` | Missing provider in test or component | Add mock to `providers: [{ provide: X, useValue: mock }]` |
| Template error: `Can't bind to 'foo'` | Child component doesn't declare `@Input` / `input()` | Add the input on the child |
| `Observable` never emits in test | Called `expectOne` before `.subscribe()` | Subscribe first, then assert the HTTP request (see T1) |
| Changes don't show in UI | Forgot `detectChanges()` in tests, or signal not updated | Call `fixture.detectChanges()` after state changes |
| `ng serve` works but test fails | Tests use isolated `TestBed`, not full `app.config.ts` | Provide dependencies explicitly in each spec's `beforeEach` |
