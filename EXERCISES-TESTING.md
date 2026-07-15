# Foil Vault Search — Testing Exercises

Parallel learning track for Jasmine + Karma unit tests. Un-skip (`xit` → `it`) specs as you complete the matching app phases in [EXERCISES.md](./EXERCISES.md).

**Audience:** Comfortable with TypeScript and React testing (Jest, React Testing Library) — new to Angular testing. If you've written `render(<Button onClick={fn} />)` and mocked `fetch`, you have the right instincts; Angular uses different tooling with the same ideas.

**How to use these guides:** Each phase has detailed step-by-step instructions with copyable assertions. After each code block you will see three short notes:

| Label                  | Meaning                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **Why**                | Why the test is written this way — what behavior you are proving                                   |
| **What**               | What the assertion or setup does                                                                   |
| **How the test works** | TestBed / `HttpTestingController` / `fakeAsync` mechanics — order of operations and what runs when |

If a spec is already green, skip to **Verify**. Prefer reading the `// TODO(test-learn):` comments in the `*.spec.ts` files alongside this doc.

**If already done:** T1, T1b, and T2 may already be implemented and passing in this repo. Those sections start with a skip note.

**Runtime note:** App specs and helpers live under **`apps/web/`**. All file paths below are **repo-root paths** (e.g. `apps/web/src/app/...`). Run tests with **`pnpm test`** from the repo root (or `pnpm --filter @foil-vault/web test`). Unit tests fake HTTP against `SCRYFALL_API_BASE_URL` (`http://localhost:3000`) — they do **not** require the API process and must not hit the network.

**Repo layout (testing):**

```
apps/web/src/app/**/*.spec.ts     component and service specs
apps/web/src/app/testing/         builders, helpers, fixture re-exports
apps/web/karma.conf.js            Karma config (Puppeteer Chrome)
```

---

## React testing → Angular testing

| React (Jest + RTL)                 | Angular (Jasmine + Karma)                                    |
| ---------------------------------- | ------------------------------------------------------------ |
| `describe` / `it`                  | Same — Jasmine uses identical blocks                         |
| `it.skip` / `test.skip`            | `xit` or `xdescribe`                                         |
| `render(<Component />)`            | `TestBed.createComponent(Component)` → `fixture`             |
| `screen.getByRole(...)`            | `fixture.nativeElement.querySelector(...)` or `DebugElement` |
| `fireEvent.click(...)`             | `button.click()` on native element, or `triggerEventHandler` |
| `jest.mock('./api')`               | `providers: [{ provide: ApiService, useValue: mock }]`       |
| MSW / `fetch` mock                 | `HttpTestingController` + `req.flush(body)`                  |
| `@testing-library/react` `waitFor` | Often unnecessary; use `fakeAsync` + `tick()` for timers     |
| Import component directly          | `TestBed.configureTestingModule({ imports: [Component] })`   |

**TestBed** is a mini Angular app built per test file. You declare which component to test, which real modules to import, and which services to replace with mocks. Unlike Jest auto-mocking, **you must list providers explicitly** — if a component injects `ScryfallApiService`, the test must either provide HTTP or mock that service.

**Key rule for HTTP tests:** `HttpClient` does nothing until you **subscribe**. Always: call the service → subscribe → then `expectOne` → then `flush`.

**Signal inputs in tests:** Use `fixture.componentRef.setInput('name', value)` then `fixture.detectChanges()` — like re-rendering with new props.

---

## How to work through this track

For each phase:

1. Finish the matching **app phase** in [EXERCISES.md](./EXERCISES.md).
2. Open the listed `*.spec.ts` file(s).
3. Change `xit` → `it` only for the tests listed in that section.
4. Replace `fail('TODO: ...')` with real assertions.
5. Run `pnpm test` and fix failures before continuing.

**Do not un-skip tests ahead of schedule.** Specs marked `xit` are placeholders for later phases. Un-skipping early adds noise and failures unrelated to what you're learning.

**Expected test counts:** Roughly a dozen+ passing smoke tests at the start; each phase adds a few more. If many unrelated tests fail, check whether you un-skipped too many specs or missed a collateral fix (T1b).

| App phase       | Test phase   | Main thing you prove                         |
| --------------- | ------------ | -------------------------------------------- |
| 0 Orientation   | T0           | Tests run; read a spec file                  |
| 1 `getCardById` | T1 + **T1b** | HTTP service call; mock service in page spec |
| 2 `searchCards` | T2           | Search HTTP + error handling                 |
| 3 Search UI     | T3           | Component inputs/outputs                     |
| 4 URL state     | T4           | Search page + query params                   |
| 5 Detail UI     | T5           | Page integration with mocked API             |
| 6 Syntax guide  | (optional)   | Smoke / title asserts if you un-skip         |
| Stretch         | T6           | Timers, cache, debounce                      |

---

## T0 — Orientation (Day 1)

### Goal

Run tests, understand TestBed, read one spec stub.

### In scope / out of scope

| In scope                  | Out of scope           |
| ------------------------- | ---------------------- |
| Run suite; skim one `xit` | Writing assertions yet |

### Prerequisites

App Phase 0 complete.

### Concepts you need

- **`it`** — runs and must pass
- **`xit`** — skipped; does not fail the suite (like `it.skip`)
- **`beforeEach` + `TestBed`** — fresh mini-app per test
- **`HttpTestingController`** — fake HTTP backend; `afterEach(() => httpMock.verify())` ensures no stray requests

### Step-by-step

1. Run `pnpm test` (or `pnpm --filter @foil-vault/web test -- --no-watch --browsers=ChromeHeadless` for CI-style)
2. Confirm all **enabled** tests pass — mainly smoke `should create` tests; exercise specs stay `xit` until later
3. Open `apps/web/src/app/core/services/scryfall-api.service.spec.ts` and read the structure:
   - `beforeEach` + `TestBed.configureTestingModule({ providers: [...] })`
   - `provideHttpClient()` + `provideHttpClientTesting()` — required for any test that exercises real HTTP through the service
   - `HttpTestingController` injected as `httpMock`
   - Comments `TODO(test-learn)` near exercise specs
   - After each code block in this guide, read **Why / What / How the test works** — same pattern as [EXERCISES.md](./EXERCISES.md)

   **Why (T0):** Before writing assertions, understand the test harness you'll reuse in T1–T2.
   **What:** A service spec uses the real service + fake HTTP backend, not a mocked service.
   **How the test works:** `afterEach(() => httpMock.verify())` fails the suite if any request was not flushed — catches leaked HTTP.

4. Compare to React mentally: `TestBed.configureTestingModule` ≈ wrapping in providers; `createComponent` ≈ `render()`

### Verify

`ng test` / `pnpm test` green; skipped tests do not fail the suite.

### Next

App Phase 1, then **T1**.

---

## T1 — Service test: getCardById

> **If already done:** If `getCardById should GET /cards/:id` is already an `it` and passes, skip to **Verify**, then do **T1b**.

### Goal

Un-skip and implement `getCardById should GET /cards/:id`.

### In scope / out of scope

| In scope              | Out of scope       |
| --------------------- | ------------------ |
| One service HTTP test | Component UI tests |

### Prerequisites

App Phase 1 (`getCardById` implemented in the service).

### Files to edit

- `apps/web/src/app/core/services/scryfall-api.service.spec.ts`

### Concepts you need

- Subscribe first, then `expectOne`, then `flush` — HTTP is lazy
- Helpers: `ScryfallCardBuilder`, `expectOneScryfallCard`

### Step-by-step

1. Change `xit` → `it` on the `getCardById` test only (if still skipped).
2. Remove any `fail('TODO: ...')` line.
3. **Arrange** — build the fake API response:

   ```ts
   const id = "abc";
   const expected = ScryfallCardBuilder.create().withId(id).build();
   let result: ScryfallCard | undefined;
   ```

   **Why:** Tests should not depend on real network or the local API process — you control the response shape.
   **What:** Creates a known card object and a variable to capture the service result.
   **How the test works:** `ScryfallCardBuilder` produces valid `ScryfallCard` JSON. `result` starts `undefined` so a passing test proves the subscribe callback ran.

4. **Act** — call the service and subscribe (this triggers the HTTP request):

   ```ts
   service.getCardById(id).subscribe((card) => (result = card));
   ```

   **Why:** `HttpClient` Observables are lazy — no request exists until subscribe (the #1 Angular HTTP testing mistake).
   **What:** Invokes the real `ScryfallApiService` method under test.
   **How the test works:** Subscribe runs synchronously up to the point the request is queued; the callback runs later when you `flush`.

5. **Assert request** — capture the in-flight request:

   ```ts
   const req = expectOneScryfallCard(httpMock, id);
   ```

   **Why:** Proves the service called the correct URL (`http://localhost:3000/cards/:id` via `SCRYFALL_API_BASE_URL`).
   **What:** Finds exactly one outstanding HTTP request matching the card id.
   **How the test works:** `HttpTestingController` records requests from `provideHttpClientTesting()`. `expectOne` fails if zero or multiple requests exist.

6. **Respond** — simulate the server:

   ```ts
   req.flush(expected);
   ```

   **Why:** Completes the Observable with fake JSON — like MSW `res(ctx.json(...))`.
   **What:** Sends `expected` as the response body with HTTP 200.
   **How the test works:** `flush` synchronously delivers the body to subscribers; `result` is assigned in the same turn.

7. **Assert result:**

   ```ts
   expect(result).toEqual(expected);
   ```

   **Why:** Confirms the service forwards the parsed body without mutation.
   **What:** Deep-equality check on the emitted card.
   **How the test works:** Runs after `flush`; if subscribe order was wrong, `result` is still `undefined` and the test fails clearly.

### Common mistakes

| Mistake                                                               | Fix                                      |
| --------------------------------------------------------------------- | ---------------------------------------- |
| `expectOne` before `.subscribe()`                                     | Subscribe first — otherwise “found none” |
| Different ids in `withId`, `getCardById`, and `expectOneScryfallCard` | Use one `id` variable everywhere         |

### Verify

The `getCardById` test passes.

### Next

**Immediately do T1b** so the full suite stays green.

---

## T1b — Collateral fix: CardDetailPage smoke test

> **If already done:** If `CardDetailPage` `should create` already provides a mock `ScryfallApiService` and passes, skip to **Verify**. Leave the other two specs as **`xit`** until T5.

### Goal

Keep `should create` passing after App Phase 1 wired `getCardById` into the detail page. Full detail assertions wait for T5.

### Why this exists

After App Phase 1, `CardDetailPage` injects `ScryfallApiService` and calls it in `ngOnInit`. Without a mock, `should create` fails with:

```
NullInjectorError: No provider for HttpClient!
```

This is **expected**. Component tests need the same dependencies as the component, or mocks for them.

### Prerequisites

App Phase 1 complete (page calls the API).

### Files to edit

- `apps/web/src/app/features/card-detail/card-detail.page.spec.ts`

### In scope / out of scope

| In scope                          | Out of scope                                      |
| --------------------------------- | ------------------------------------------------- |
| Mock service so smoke test passes | Un-skipping “read route param” / “load card” (T5) |

### Step-by-step

1. Confirm `should read route param id` and `should load card from service` are still **`xit`**.
2. Add a mock `ScryfallApiService` to `providers` (alongside the existing `ActivatedRoute` mock):

   ```ts
   import { of } from 'rxjs';
   import { ScryfallApiService } from '../../core/services/scryfall-api.service';

   // inside providers: [...]
   {
     provide: ScryfallApiService,
     useValue: {
       getCardById: jasmine.createSpy('getCardById').and.returnValue(of({})),
     },
   },
   ```

   **Why:** `CardDetailPage` now calls `getCardById` in `ngOnInit`. The smoke test only checks the component creates — it must not pull in real `HttpClient`.
   **What:** Replaces the real service with a spy that returns an empty Observable.
   **How the test works:** TestBed's `providers` override wins over `providedIn: 'root'`. `of({})` emits once and completes so `ngOnInit` does not throw. T5 upgrades this mock to return `cardDetailSample`.

   Returning `of({})` is enough for the smoke test — `ngOnInit` subscribes without error. T5 will use a real card object.

**React comparison:** Same idea as `jest.mock('../api', () => ({ fetchCard: jest.fn().mockResolvedValue({}) }))` — replace the dependency at the injector level.

### Verify

`pnpm test` green again (all enabled tests pass; skipped tests still skipped).

### Next

App Phase 2, then **T2**.

---

## T2 — Service tests: searchCards

> **If already done:** If both search specs are already `it` and pass, skip to **Verify**.

### Goal

Un-skip and complete both `searchCards` tests: success + zero-results 404.

### In scope / out of scope

| In scope                           | Out of scope                   |
| ---------------------------------- | ------------------------------ |
| Service HTTP success + error specs | Search UI component tests (T3) |

### Prerequisites

App Phase 2 (`searchCards` implemented).

### Files to edit

- `apps/web/src/app/core/services/scryfall-api.service.spec.ts`

### Helpers you will use

- `ScryfallListBuilder`
- `expectOneScryfallSearch`
- `flushScryfallError`

### Step-by-step — success test

1. Change `xit` → `it` on `searchCards should GET /cards/search with encoded query`.
2. Replace `fail(...)` with:

   ```ts
   const q = "lightning";
   const expected = ScryfallListBuilder.create().withDefaultCards(2).build();
   let result: ScryfallList<ScryfallCard> | undefined;

   service.searchCards(q).subscribe((list) => (result = list));

   const req = expectOneScryfallSearch(httpMock, q);
   req.flush(expected);

   expect(result).toEqual(expected);
   ```

   **Why:** Mirrors T1's Arrange–Act–Assert–flush pattern for the search endpoint.
   **What:** Verifies `searchCards` encodes `q` and returns the list body.
   **How the test works:** `expectOneScryfallSearch` asserts URL contains `/cards/search` and the `q` param. `flush` delivers `expected`; equality proves no accidental mapping.

3. Optional extra assert:

   ```ts
   expect(req.request.urlWithParams).toContain(encodeURIComponent(q));
   ```

   **Why:** Catches manual URL bugs where encoding is forgotten or doubled.
   **What:** Inspects the full URL string on the captured request.
   **How the test works:** Runs on `req` after `expectOne`; `urlWithParams` is what Angular actually sent.

### Step-by-step — error test (zero results)

1. Change `xit` → `it` on `searchCards should propagate ScryfallError on zero results`.
2. Replace `fail(...)` with:

   ```ts
   const q = "zzzzzzzzaaaaaaaaaaa";
   let capturedError: unknown;

   service.searchCards(q).subscribe({
     next: () => fail("expected an error, got success"),
     error: (err) => (capturedError = err),
   });

   const req = expectOneScryfallSearch(httpMock, q);
   flushScryfallError(req);

   expect(capturedError).toBeTruthy();
   ```

   **Why:** Zero-result search returns HTTP 404 from the mirror — the service must surface that to callers (Phase 3 maps it to an empty grid).
   **What:** Asserts the error callback runs when the server returns a Scryfall error body.
   **How the test works:** `flushScryfallError` sends 404 + `{ object: 'error', … }`. The `next: () => fail(...)` guard catches accidental success paths.

Remember: the **service** propagates the HTTP error; turning 404 into an empty list happens in the **page** (Phase 3), not necessarily in these service tests.

### Common mistakes

| Mistake                                            | Fix                            |
| -------------------------------------------------- | ------------------------------ |
| Expecting `data: []` flush for empty search        | Use `flushScryfallError` (404) |
| Calling `expectOneScryfallSearch` before subscribe | Subscribe first                |

### Verify

Both search tests pass; suite still green.

### Next

App Phase 3, then **T3**.

---

## T3 — Component tests: SearchBar + CardTile + CardGrid

### Goal

Test input/output behavior in isolation — like RTL tests that pass props and assert callbacks.

### In scope / out of scope

| In scope                             | Out of scope                                     |
| ------------------------------------ | ------------------------------------------------ |
| Emit on type (SearchBar)             | Debounce timing test (**T6** — leave that `xit`) |
| Display name + click emit (CardTile) | Router navigation asserts (Phase 4 / T4)         |
| Render N tiles (CardGrid)            | SearchPage integration (T4)                      |

### Prerequisites

App Phase 3 (search UI components implemented — emit without requiring debounce).

### Files to edit

- `apps/web/src/app/features/search/components/search-bar/search-bar.component.spec.ts`
- `apps/web/src/app/features/search/components/card-tile/card-tile.component.spec.ts`
- `apps/web/src/app/features/search/components/card-grid/card-grid.component.spec.ts`

### Concepts you need

- `fixture.componentRef.setInput('card', card)` — set a signal `input()`
- Subscribe to `output()` or spy on `.emit`
- `fixture.detectChanges()` after input changes
- DOM: `fixture.nativeElement.querySelector(...)`

---

### T3a — SearchBar: emit on type

1. Change `xit` → `it` on `should emit searchQuery when user types` only.
2. **Leave** `should debounce emissions (~300ms)` as **`xit`** until T6 / Stretch.
3. Replace `fail(...)` with:

   ```ts
   const emissions: string[] = [];
   fixture.componentInstance.searchQuery.subscribe((q) => emissions.push(q));

   const inputEl: HTMLInputElement = fixture.nativeElement.querySelector("input");
   expect(inputEl).toBeTruthy();
   expect(inputEl.disabled).toBeFalse();

   inputEl.value = "bolt";
   inputEl.dispatchEvent(new Event("input"));
   fixture.detectChanges();

   expect(emissions).toContain("bolt");
   ```

   **Why:** Proves the dumb component contract — type → emit — without involving HTTP or router (T3 scope).
   **What:** Simulates user typing and records `searchQuery` output values.
   **How the test works:** Subscribe to the component's `output()` before dispatching `input`. `detectChanges()` runs change detection so bindings/handlers run. `emissions` captures what the parent would receive.

**Alternative:** `spyOn(fixture.componentInstance.searchQuery, 'emit')` then `expect(...emit).toHaveBeenCalledWith('bolt')`.

---

### T3b — CardTile: display name

1. Change `xit` → `it` on `should display card name from @Input`.
2. The scaffold may already contain the body:

   ```ts
   const card = ScryfallCardBuilder.create().withName("Lightning Bolt").build();
   fixture.componentRef.setInput("card", card);
   fixture.detectChanges();
   expect(fixture.nativeElement.textContent).toContain("Lightning Bolt");
   ```

   **Why:** Tests presentation only — parent passes `card`, tile shows name (like RTL `render` with props).
   **What:** Sets the signal input and asserts the name appears in the DOM.
   **How the test works:** `setInput` updates a signal `@Input` before the first real parent exists. `detectChanges()` refreshes the template so `card()?.name` renders.

---

### T3c — CardTile: emit on click

1. Change `xit` → `it` on `should emit cardClick when clicked`.
2. Replace `fail(...)` with:

   ```ts
   const card = ScryfallCardBuilder.create().withName("Lightning Bolt").build();
   fixture.componentRef.setInput("card", card);
   fixture.detectChanges();

   let clicked: ScryfallCard | undefined;
   fixture.componentInstance.cardClick.subscribe((c) => (clicked = c));

   const tile: HTMLElement = fixture.nativeElement.querySelector(".card-tile") ?? fixture.nativeElement.querySelector("mat-card");
   tile.click();

   expect(clicked).toEqual(card);
   ```

   **Why:** Ensures Phase 3 wired `(click)` → `cardClick.emit` so Phase 4 navigation can listen.
   **What:** Clicks the tile and asserts the emitted card matches the input.
   **How the test works:** Subscribe to `cardClick` output, then `.click()` the native element. No router — only the output contract is tested.

Ensure App Phase 3 wired `(click)="... cardClick.emit(...)"` on the tile.

---

### T3d — CardGrid: render N tiles

1. Change `xit` → `it` on `should render N tiles from cards @Input`.
2. Replace `fail(...)` with:

   ```ts
   const cards = [ScryfallCardBuilder.create().withName("Bolt").build(), ScryfallCardBuilder.create().withName("Shock").build()];
   fixture.componentRef.setInput("cards", cards);
   fixture.detectChanges();

   const tiles = fixture.nativeElement.querySelectorAll("app-card-tile");
   expect(tiles.length).toBe(2);
   ```

   **Why:** Confirms `@for` + child selector wiring — the grid's job is "N cards → N tiles".
   **What:** Passes two cards and counts rendered `app-card-tile` elements.
   **How the test works:** `querySelectorAll` counts child component host elements in the grid template. Requires Phase 3 `@for` loop to be enabled (not `@if (false)`).

Requires the Phase 3 `@for` + `<app-card-tile>` in the grid template.

### Verify

SearchBar (emit), CardTile (name + click), and CardGrid tests pass. Debounce remains skipped.

### Common mistakes

| Mistake                                 | Fix                                        |
| --------------------------------------- | ------------------------------------------ |
| Forgot `detectChanges` after `setInput` | Always call it before asserting DOM        |
| Input still `disabled`                  | Finish SearchBar wiring in App Phase 3     |
| Un-skipped debounce too early           | Change it back to `xit` until Stretch / T6 |

### Next

App Phase 4, then **T4**.

---

## T4 — Search page: service call + URL query params

### Goal

Prove SearchPage wires the bar to `searchCards`, and (after Phase 4) that `q` syncs with the URL.

### In scope / out of scope

| In scope                                                             | Out of scope                 |
| -------------------------------------------------------------------- | ---------------------------- |
| Existing `apps/web/src/app/features/search/search.page.spec.ts` xits | Detail page tests (T5)       |
| Optional new test for `q` query-param sync                           | Real HTTP / Scryfall network |

### Prerequisites

App Phase 3 for the service-call test; App Phase 4 for query-param sync.

### Files to edit

- `apps/web/src/app/features/search/search.page.spec.ts`

Helpers (for query-param test): `setupRouterTesting`, `navigateWithQueryParams` from `apps/web/src/app/testing/helpers/router-test.helpers.ts`.

### Note on existing stubs

The scaffold currently has:

- `xit('should render placeholder checklist')` — early Phase 3 text assert; **skip or delete** once you remove the placeholder copy from the page template (it will fail after you clean up the UI).
- `xit('should call service on search')` — implement after Phase 3 UI works (see T4a). After Phase 4’s URL-driven design, trigger search via the bar (which updates `q`) or call `onSearch` / set query params so the page’s `queryParamMap` path runs.

There is **no** pre-written `xit` for query params — add a new `it` (T4b) when Phase 4 is done.

---

### T4a — Call service on search (Phase 3)

Do this once the search bar updates `cards` via `searchCards` (before or after Phase 4 URL wiring).

1. Change `xit` → `it` on `should call service on search`.
2. The `beforeEach` already mocks `searchCards` with a spy — reuse it:

   ```ts
   const api = TestBed.inject(ScryfallApiService);
   const searchSpy = api.searchCards as jasmine.Spy;

   const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
   input.value = "lightning";
   input.dispatchEvent(new Event("input"));
   fixture.detectChanges();

   expect(searchSpy).toHaveBeenCalled();
   expect(searchSpy.calls.mostRecent().args[0]).toBe("lightning");
   ```

   **Why:** Integration test at page level — bar → page → service, but still no real HTTP (spy from `beforeEach`).
   **What:** Types in the search bar and asserts `searchCards` was called with the typed query.
   **How the test works:** The mock replaces the real service. Typing fires `searchQuery` → `onSearch` → (Phase 3) direct `searchCards` or (Phase 4) navigate then `queryParamMap` → `searchCards`. Adjust asserts if you moved to URL-driven search only.

   After Phase 4 (URL is the source of truth), `onSearch` only navigates — so either:
   - Spy on `Router.navigate` and assert `queryParams.q`, **or**
   - Provide a mock `ActivatedRoute` whose `queryParamMap` emits `{ q: 'lightning' }` and assert `searchCards` was called

   Typing in the input should still eventually call `searchCards` if navigate updates the URL and your `queryParamMap` subscription runs. If tests don’t update the real router, prefer asserting `router.navigate` from `onSearch`, or call `runSearch` / emit on a mock `queryParamMap`.

3. Remove or keep skipped the placeholder checklist test once that text is gone.

---

### T4b — Query param sync (add if missing)

After App Phase 4, add something like:

```ts
import { setupRouterTesting, navigateWithQueryParams } from "../../testing/helpers/router-test.helpers";

it("should read q from the URL and search", async () => {
  const harness = await setupRouterTesting([{ path: "search", component: SearchPage }], "/search");

  // Ensure ScryfallApiService is still mocked in the TestBed used by setupRouterTesting —
  // if the helper creates its own TestBed, provide the mock there the same way as beforeEach.

  await navigateWithQueryParams(harness, "/search", { q: "bolt" });

  const api = TestBed.inject(ScryfallApiService);
  expect(api.searchCards as jasmine.Spy).toHaveBeenCalled();
});
```

**Why:** Phase 4 makes the URL the source of truth — this test proves landing with `?q=` triggers search, not only typing in the bar.
**What:** Boots a router harness, navigates with query params, asserts the search spy fired.
**How the test works:** `setupRouterTesting` creates a real mini-router around `SearchPage`. `navigateWithQueryParams` updates the URL; your `queryParamMap` subscription should call `runSearch`.

If `setupRouterTesting` is awkward with your current providers, a lighter approach is fine:

```ts
it("should navigate with q when searching", () => {
  const router = TestBed.inject(Router);
  spyOn(router, "navigate").and.resolveTo(true);

  fixture.componentInstance.onSearch("bolt");

  expect(router.navigate).toHaveBeenCalled();
  // Optionally inspect queryParams in the call args
});
```

**Why:** Simpler when full router harness is heavy — still validates Phase 4's "bar writes URL" contract.
**What:** Spies on `Router.navigate` and calls `onSearch` directly.
**How the test works:** No real navigation; you inspect `navigate` call args for `queryParams: { q: 'bolt' }`. Pair with a separate test or manual verify that `queryParamMap` calls `searchCards`.

Pick one style and keep the test stable.

### Verify

- Typing/search invokes `searchCards` (spy)
- With Phase 4: URL `q` participates in search or navigate asserts as you designed

### Next

App Phase 5, then **T5**.

---

## T5 — Integration: CardDetailPage (+ detail children)

### Goal

Un-skip remaining detail page specs; mock service + route param; assert the card renders. Also un-skip companion child component specs.

### In scope / out of scope

| In scope                                        | Out of scope          |
| ----------------------------------------------- | --------------------- |
| Route param + load + DOM assert on detail page  | Cache / debounce (T6) |
| Card image / faces / legalities component specs | Real HTTP             |

### Prerequisites

App Phase 5 (detail UI implemented).

### Files to edit

- `apps/web/src/app/features/card-detail/card-detail.page.spec.ts`
- `apps/web/src/app/features/card-detail/components/card-image/card-image.component.spec.ts`
- `apps/web/src/app/features/card-detail/components/card-faces/card-faces.component.spec.ts`
- `apps/web/src/app/features/card-detail/components/card-legalities/card-legalities.component.spec.ts`

### Helpers / fixtures

```ts
import { cardDetailSample } from "../../testing/fixtures";
```

Do **not** use `HttpTestingController` here — keep mocking `ScryfallApiService`.

---

### T5a — Route param id

1. Change `xit` → `it` on `should read route param id`.
2. Body is usually already:

   ```ts
   expect(fixture.componentInstance.cardId).toBe("test-card-id");
   ```

   **Why:** Route config + `ActivatedRoute` mock must feed the same id the page reads from `paramMap`.
   **What:** Asserts the page captured the `:id` route param from the test setup.
   **How the test works:** The spec's `ActivatedRoute` provider supplies `{ id: 'test-card-id' }`. If your property is a signal, assert `fixture.componentInstance.cardId()` instead.

---

### T5b — Load card from service and render

1. Upgrade the T1b mock in `beforeEach` to return the fixture:

   ```ts
   {
     provide: ScryfallApiService,
     useValue: {
       getCardById: jasmine
         .createSpy('getCardById')
         .and.returnValue(of(cardDetailSample)),
     },
   },
   ```

   **Why:** T5b needs a realistic card shape in the DOM — empty `{}` from T1b is not enough to assert name/faces.
   **What:** Mock returns the shared DFC fixture when the page loads.
   **How the test works:** `ngOnInit` subscribes; `of(cardDetailSample)` emits synchronously so `card` signal updates before assertions.

   If you also inject `CardCacheService` on the page, either provide a stub `{ get: () => undefined, set: () => undefined, evict: () => undefined }` or let the real stub cache run (it returns `undefined` today).

2. Change `xit` → `it` on `should load card from service`.
3. Replace `fail(...)` with:

   ```ts
   const api = TestBed.inject(ScryfallApiService);
   expect(api.getCardById).toHaveBeenCalledWith("test-card-id");

   fixture.detectChanges();
   expect(fixture.nativeElement.textContent).toContain((cardDetailSample as { name: string }).name);
   ```

   **Why:** Proves the load pipeline calls the API with the route id and renders the card name — integration without HTTP.
   **What:** Spy assertion + DOM text check.
   **How the test works:** `getCardById` runs during `ngOnInit` on first `detectChanges`. Second `detectChanges` ensures template reflects `card()` after the mock emits.

   The sample name is a DFC-style string like `Delver of Secrets // Insectile Aberration` — assert a distinctive substring if the full string is awkward.

---

### T5c — CardImageComponent

Un-skip `should render img when imageUris provided` (or equivalent):

```ts
fixture.componentRef.setInput("imageUris", {
  small: "https://example.com/s.jpg",
  normal: "https://example.com/card.jpg",
  large: "https://example.com/l.jpg",
});
fixture.componentRef.setInput("alt", "Test Card");
fixture.detectChanges();

expect(fixture.nativeElement.querySelector("img")?.src).toContain("example.com/card.jpg");
```

**Why:** Image child should render `normal` for detail view when parent passes URIs explicitly.
**What:** Sets inputs and checks the `<img src>`.
**How the test works:** Isolated component test — no page, no API. Browser may normalize `src` to absolute URL; `toContain` avoids brittle full-string matches.

---

### T5d — CardFacesComponent

Un-skip and pass faces:

```ts
fixture.componentRef.setInput("faces", [
  {
    object: "card_face",
    name: "Delver of Secrets",
    mana_cost: "",
    type_line: "Creature — Human Wizard",
    oracle_text: "...",
  },
  {
    object: "card_face",
    name: "Insectile Aberration",
    mana_cost: "",
    type_line: "Creature — Insect Horror",
    oracle_text: "...",
  },
]);
fixture.detectChanges();

const text = fixture.nativeElement.textContent;
expect(text).toContain("Delver of Secrets");
expect(text).toContain("Insectile Aberration");
```

**Why:** DFC layout depends on `card_faces` — this spec guards the `@for` template from Phase 5.
**What:** Renders two face names from the `faces` input.
**How the test works:** Minimal face objects satisfy the template; full `ScryfallCardFace` fields optional unless strict templates complain.

(Adjust fields if `ScryfallCardFace` requires more properties — use `ScryfallCardBuilder` / sample `card_faces` if easier.)

---

### T5e — CardLegalitiesComponent

Un-skip (body may already assert):

```ts
fixture.componentRef.setInput("legalities", {
  modern: "legal",
  standard: "not_legal",
});
fixture.detectChanges();

const text = fixture.nativeElement.textContent;
expect(text).toContain("modern");
expect(text).toContain("legal");
```

**Why:** Table component is already implemented — test only that rows render from the `legalities` input.
**What:** Passes a small legalities map and asserts key strings appear.
**How the test works:** Material table + `textContent` scan; no need to assert every format if smoke substrings pass.

### Verify

All three `CardDetailPage` tests pass; image / faces / legalities child specs you un-skipped pass.

### Next

App Phase 6 (optional tests), and/or Stretch + **T6**.

---

## T6 — Stretch: cache, debounce, rate limiter

### Goal

Un-skip and implement timing / cache specs for the stretch features you built.

### In scope / out of scope

| In scope                                | Out of scope                     |
| --------------------------------------- | -------------------------------- |
| Only the stretch pieces you implemented | Forcing yourself to do all three |

### Prerequisites

Matching Stretch sections in [EXERCISES.md](./EXERCISES.md) (S1–S3).

### Files to edit

- `apps/web/src/app/core/services/card-cache.service.spec.ts`
- `apps/web/src/app/core/services/search-rate-limiter.service.spec.ts`
- `apps/web/src/app/features/search/components/search-bar/search-bar.component.spec.ts` (debounce `xit`)

### Concepts you need

- **`fakeAsync` + `tick(ms)`** — Jasmine fake timers (≈ Jest fake timers)
- Import `fakeAsync`, `tick` from `@angular/core/testing`
- Constant `RATE_LIMIT_MS` from `apps/web/src/app/core/constants/scryfall.constants.ts` (500)

---

### T6a — CardCacheService

Un-skip the three cache specs and implement along these lines:

```ts
const card = ScryfallCardBuilder.create().withId("abc").build();

// set + get
service.set("abc", card);
expect(service.get("abc")).toEqual(card);

// get miss
expect(service.get("missing")).toBeUndefined();

// evict
service.evict("abc");
expect(service.get("abc")).toBeUndefined();
```

**Why:** Cache is pure in-memory logic — no TestBed DOM or HTTP required; fast unit tests for Stretch S2.
**What:** Exercises set, get hit/miss, and evict.
**How the test works:** Uses the real `CardCacheService` from TestBed (or `new` if you prefer). Each `it` block should be independent — evict test assumes prior set in the same spec.

If you implemented LRU max-size eviction, add an extra `it` that inserts past the limit and asserts the oldest key is gone.

---

### T6b — SearchBar debounce

1. Change `xit` → `it` on `should debounce emissions (~300ms)`.
2. Replace `fail(...)` with:

   ```ts
   import { fakeAsync, tick } from "@angular/core/testing";

   // wrap the it callback:
   // it('...', fakeAsync(() => { ... }));

   const emissions: string[] = [];
   fixture.componentInstance.searchQuery.subscribe((q) => emissions.push(q));

   const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
   input.value = "a";
   input.dispatchEvent(new Event("input"));

   tick(100);
   expect(emissions.length).toBe(0);

   tick(200); // total 300ms
   expect(emissions).toEqual(["a"]);
   ```

   **Why:** Debounce is time-based — `fakeAsync` avoids flaky real `setTimeout` waits in CI.
   **What:** Asserts no emit before 300ms and exactly one emit after.
   **How the test works:** `fakeAsync` patches timers; `tick(ms)` advances virtual time synchronously. Matches Stretch S1's `debounceTime(300)` pipe.

If you also use `distinctUntilChanged`, emitting the same value twice should only push once.

---

### T6c — SearchRateLimiterService

Un-skip `schedule should space requests by RATE_LIMIT_MS`:

```ts
import { fakeAsync, tick } from "@angular/core/testing";
import { of } from "rxjs";
import { RATE_LIMIT_MS } from "../constants/scryfall.constants";

it("schedule should space requests by RATE_LIMIT_MS", fakeAsync(() => {
  const order: number[] = [];

  service
    .schedule(() => {
      order.push(1);
      return of(1);
    })
    .subscribe();

  service
    .schedule(() => {
      order.push(2);
      return of(2);
    })
    .subscribe();

  // Depending on your implementation, the first may run immediately:
  expect(order).toEqual([1]);

  tick(RATE_LIMIT_MS);
  expect(order).toEqual([1, 2]);
}));
```

**Why:** Rate limiter behavior is defined by delays — `fakeAsync` + shared constant keeps test aligned with production spacing.
**What:** Schedules two jobs and asserts the second runs only after `RATE_LIMIT_MS`.
**How the test works:** `order` records execution sequence. First job may run immediately (queue design choice); second must wait at least one `tick(RATE_LIMIT_MS)`.

Tune expectations to match your queue design (some implementations delay the _first_ call too — adjust asserts accordingly; the important part is spacing ≥ `RATE_LIMIT_MS`).

### Verify

All un-skipped stretch tests pass; no timer leaks (avoid leaving pending `tick`s unfinished inside `fakeAsync`).

---

## Optional — Syntax guide specs

**Prerequisites:** App Phase 6.

**File:** `apps/web/src/app/features/syntax-guide/syntax-guide.page.spec.ts`

Typical xits:

- Render all `SYNTAX_SECTIONS` titles → assert each `section.title` in `textContent`
- Try-it navigation → click a Try it control and assert `Router` navigation or `href` / query params

Only un-skip if you want; the main track does not require them.

---

## Test helpers (already implemented)

You write specs that **use** these — you don't need to build them:

| Helper                                      | Location                                                     | Purpose                    |
| ------------------------------------------- | ------------------------------------------------------------ | -------------------------- |
| `ScryfallCardBuilder`                       | `apps/web/src/app/testing/builders/scryfall-card.builder.ts` | Fluent test card factory   |
| `ScryfallListBuilder`                       | `apps/web/src/app/testing/builders/scryfall-list.builder.ts` | Paginated list factory     |
| `expectOneScryfallSearch`                   | `apps/web/src/app/testing/helpers/http-test.helpers.ts`      | Assert search HTTP call    |
| `expectOneScryfallCard`                     | `apps/web/src/app/testing/helpers/http-test.helpers.ts`      | Assert detail HTTP call    |
| `flushScryfallError`                        | `apps/web/src/app/testing/helpers/http-test.helpers.ts`      | Simulate 404 error body    |
| `setupRouterTesting`                        | `apps/web/src/app/testing/helpers/router-test.helpers.ts`    | RouterTestingHarness setup |
| `navigateWithQueryParams`                   | `apps/web/src/app/testing/helpers/router-test.helpers.ts`    | Navigate with query string |
| `searchResponseSample` / `cardDetailSample` | `apps/web/src/app/testing/fixtures/index.ts`                 | Typed JSON fixtures        |

---

## Conventions

- `// TODO(test-learn):` — your test task
- `// HINT:` — suggested matcher or setup
- `xit` / `xdescribe` — skipped until ready; **leave these alone** until the matching phase
- Prefer Arrange / Act / Assert in longer tests
- Always mock HTTP in **component** unit tests — never hit the network (local API or Scryfall)
- Service specs may use `HttpTestingController` (fake backend against `SCRYFALL_API_BASE_URL`) — still no network / no `pnpm start` required

---

## Troubleshooting

| Error                                             | Cause                                           | Fix                                                                                                          |
| ------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `Expected one matching request ... found none`    | `expectOne` called before `.subscribe()`        | Subscribe first, then `expectOne`, then `flush`                                                              |
| `No provider for HttpClient`                      | Component/service under test needs HTTP         | Mock the service (preferred for component tests) or add `provideHttpClient()` + `provideHttpClientTesting()` |
| `Expected no open requests` in `afterEach`        | Subscribed in a component test but didn't flush | Mock the service so no real HTTP is triggered, or flush pending requests                                     |
| Test passes alone but fails in suite              | Leaked subscription or shared state             | Check `afterEach`; ensure `httpMock.verify()` runs                                                           |
| `Cannot read properties of undefined` after flush | Wrong variable for result assertion             | Assign in subscribe callback; assert after flush                                                             |
| Many failures after one app change                | Un-skipped specs too early                      | Change `it` back to `xit` for phases you haven't reached                                                     |
| Debounce test flakes or never emits               | Not using `fakeAsync` / wrong `tick` total      | Wrap in `fakeAsync`, `tick(300)` after input                                                                 |
| `Can't bind` / empty DOM after `setInput`         | Forgot `detectChanges()`                        | Call `fixture.detectChanges()` after setting inputs                                                          |

---

## Phase boundary reminders (stay consistent with EXERCISES.md)

| Topic                           | App phase     | Test phase                                         |
| ------------------------------- | ------------- | -------------------------------------------------- |
| Emit search query (no debounce) | Phase 3       | T3a                                                |
| Debounce 300ms                  | Stretch S1    | T6b                                                |
| Tile click navigate             | Phase 4       | Covered indirectly via page; tile only emits in T3 |
| URL `q` / `page`                | Phase 4       | T4b                                                |
| Detail UI                       | Phase 5       | T5                                                 |
| Cache / rate limit              | Stretch S2–S3 | T6a / T6c                                          |
