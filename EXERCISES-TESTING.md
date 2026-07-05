# Foil Vault Search — Testing Exercises

Parallel learning track for Jasmine + Karma unit tests. Un-skip (`xit` → `it`) specs as you complete the matching app phases in [EXERCISES.md](./EXERCISES.md).

---

## T0 — Orientation (Day 1)

**Prerequisites:** Phase 0 complete.

**Goal:** Run tests, understand TestBed, read one spec stub.

**Steps:**
1. Run `npm test` (or `ng test --no-watch --browsers=ChromeHeadless` for CI-style)
2. Confirm all **enabled** tests pass (smoke `should create` tests only)
3. Open `src/app/core/services/scryfall-api.service.spec.ts` — note the pattern:
   - `beforeEach` + `TestBed.configureTestingModule`
   - `provideHttpClient()` + `provideHttpClientTesting()`
   - `xit` for exercises, `it` for smoke tests

**Verify:** `ng test` green; skipped tests do not fail the suite.

**Concepts:** TestBed, Jasmine `describe`/`it`/`xit`, `HttpTestingController`

---

## T1 — Service test: getCardById

**Prerequisites:** App Phase 1 (`getCardById` implemented).

**Files to edit:**
- `src/app/core/services/scryfall-api.service.spec.ts`

**Goal:** Un-skip and implement `getCardById should GET /cards/:id`.

**Hints:**
- Use `ScryfallCardBuilder.create().withId('abc').build()` for expected response
- Use `expectOneScryfallCard(httpMock, 'abc')` from `testing/helpers/http-test.helpers.ts`
- Arrange / Act / Assert pattern

**Verify:** Un-skipped getCardById test passes; `ng test` still green.

**Concepts:** `HttpTestingController`, `req.flush()`, typed mock responses

---

## T2 — Service tests: searchCards

**Prerequisites:** App Phase 2 (`searchCards` implemented).

**Files to edit:**
- `src/app/core/services/scryfall-api.service.spec.ts`

**Goal:** Un-skip search success + ScryfallError tests.

**Hints:**
- Success: `ScryfallListBuilder.create().withDefaultCards(2).build()`
- Error: `flushScryfallError(req)` for zero-results 404
- Assert URL contains encoded query string

**Verify:** Both search tests pass.

**Concepts:** Error response simulation, URL encoding assertions

---

## T3 — Component tests: SearchBar + CardTile

**Prerequisites:** App Phase 3 (search UI components implemented).

**Files to edit:**
- `src/app/features/search/components/search-bar/search-bar.component.spec.ts`
- `src/app/features/search/components/card-tile/card-tile.component.spec.ts`
- `src/app/features/search/components/card-grid/card-grid.component.spec.ts`

**Goal:** Test `@Input`/`@Output` behavior in isolation.

**Hints:**
- `fixture.componentRef.setInput('card', card)` for signal inputs
- Subscribe to `component.searchQuery.subscribe(...)` or use `spyOn`
- Query DOM with `fixture.nativeElement.querySelector`

**Verify:** Component tests pass for bar, tile, and grid.

**Concepts:** `ComponentFixture`, `DebugElement`, signal `input()`/`output()`

---

## T4 — Router tests: query params

**Prerequisites:** App Phase 4 (URL state sync).

**Files to edit:**
- `src/app/features/search/search.page.spec.ts`

**Goal:** Test query param sync and navigation.

**Hints:**
- Use `setupRouterTesting()` and `navigateWithQueryParams()` from `testing/helpers/router-test.helpers.ts`
- Or mock `ActivatedRoute` with `queryParamMap`

**Verify:** Search page reads/writes `q` param correctly.

**Concepts:** `RouterTestingHarness`, query params, `provideRouter`

---

## T5 — Integration: CardDetailPage

**Prerequisites:** App Phase 5 (card detail UI).

**Files to edit:**
- `src/app/features/card-detail/card-detail.page.spec.ts`

**Goal:** Mock service + route param; assert card renders.

**Hints:**
- Provide mock `ScryfallApiService` with `getCardById` returning `of(card)`
- Mock `ActivatedRoute` with param `id`
- Use `cardDetailSample` from `testing/fixtures/`

**Verify:** Detail page test loads and displays card name.

**Concepts:** Service mocking, route param testing, fixture JSON

---

## T6 — Stretch: cache, debounce, rate limiter

**Prerequisites:** Stretch goals implemented.

**Files to edit:**
- `src/app/core/services/card-cache.service.spec.ts`
- `src/app/core/services/search-rate-limiter.service.spec.ts`
- `src/app/features/search/components/search-bar/search-bar.component.spec.ts` (debounce)

**Hints:**
- Cache: set then get, evict, assert undefined
- Debounce: `fakeAsync(() => { ... tick(300); ... })`
- Rate limiter: queue two requests, assert spacing with `tick(RATE_LIMIT_MS)`

**Verify:** All un-skipped stretch tests pass.

**Concepts:** `fakeAsync`, `tick`, timing-sensitive RxJS

---

## Test helpers (already implemented)

You write specs that **use** these — you don't need to build them:

| Helper | Location | Purpose |
|--------|----------|---------|
| `ScryfallCardBuilder` | `testing/builders/scryfall-card.builder.ts` | Fluent test card factory |
| `ScryfallListBuilder` | `testing/builders/scryfall-list.builder.ts` | Paginated list factory |
| `expectOneScryfallSearch` | `testing/helpers/http-test.helpers.ts` | Assert search HTTP call |
| `expectOneScryfallCard` | `testing/helpers/http-test.helpers.ts` | Assert detail HTTP call |
| `flushScryfallError` | `testing/helpers/http-test.helpers.ts` | Simulate 404 error body |
| `setupRouterTesting` | `testing/helpers/router-test.helpers.ts` | RouterTestingHarness setup |
| `navigateWithQueryParams` | `testing/helpers/router-test.helpers.ts` | Navigate with query string |

---

## Conventions

- `// TODO(test-learn):` — your test task
- `// HINT:` — suggested matcher or setup
- `xit` / `xdescribe` — skipped until ready
- Prefer Arrange / Act / Assert in longer tests
- Always mock HTTP — never hit real Scryfall in unit tests
