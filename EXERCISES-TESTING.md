# Foil Vault Search — Testing Exercises

Parallel learning track for Jasmine + Karma unit tests. Un-skip (`xit` → `it`) specs as you complete the matching app phases in [EXERCISES.md](./EXERCISES.md).

**Audience:** Comfortable with TypeScript and React testing (Jest, React Testing Library) — new to Angular testing. If you've written `render(<Button onClick={fn} />)` and mocked `fetch`, you have the right instincts; Angular uses different tooling with the same ideas.

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

---

## How to work through this track

For each phase:

1. Finish the matching **app phase** in [EXERCISES.md](./EXERCISES.md).
2. Open the listed `*.spec.ts` file(s).
3. Change `xit` → `it` only for the tests listed in that section.
4. Replace `fail('TODO: ...')` with real assertions.
5. Run `npm test` and fix failures before continuing.

**Do not un-skip tests ahead of schedule.** Specs marked `xit` are placeholders for later phases. Un-skipping early adds noise and failures unrelated to what you're learning.

**Expected test counts:** Initially ~14 passing, ~20 skipped. Each phase adds a few more passing tests. If many unrelated tests fail, check whether you un-skipped too many specs or missed a collateral fix (T1b).

---

## T0 — Orientation (Day 1)

**Prerequisites:** App Phase 0 complete.

**Goal:** Run tests, understand TestBed, read one spec stub.

**Steps:**

1. Run `npm test` (or `ng test --no-watch --browsers=ChromeHeadless` for CI-style)
2. Confirm all **enabled** tests pass — only smoke `should create` tests, everything else is `xit`
3. Open `src/app/core/services/scryfall-api.service.spec.ts` and read the structure:
   - `beforeEach` + `TestBed.configureTestingModule({ providers: [...] })`
   - `provideHttpClient()` + `provideHttpClientTesting()` — required for any test touching HTTP
   - `HttpTestingController` injected as `httpMock`; `afterEach(() => httpMock.verify())` ensures no stray requests
   - `xit` = exercise waiting for you; `it` = smoke test that must pass now
4. Compare to a React test mentally: `TestBed.configureTestingModule` ≈ wrapping in providers; `createComponent` ≈ `render()`

**Verify:** `ng test` green; skipped tests do not fail the suite.

**Concepts:** TestBed, Jasmine `describe`/`it`/`xit`, `HttpTestingController`

---

## T1 — Service test: getCardById

**Prerequisites:** App Phase 1 (`getCardById` implemented in the service).

**Files to edit:**

- `src/app/core/services/scryfall-api.service.spec.ts`

**Goal:** Un-skip and implement `getCardById should GET /cards/:id`.

**Step-by-step:**

1. Change `xit` → `it` on the `getCardById` test only.
2. Remove the `fail('TODO: ...')` line.
3. **Arrange** — build the fake API response:
   ```ts
   const id = "abc";
   const expected = ScryfallCardBuilder.create().withId(id).build();
   let result: ScryfallCard | undefined;
   ```
4. **Act** — call the service and subscribe (this triggers the HTTP request):
   ```ts
   service.getCardById(id).subscribe((card) => (result = card));
   ```
5. **Assert request** — now that the request is in flight, capture it:
   ```ts
   const req = expectOneScryfallCard(httpMock, id);
   ```
6. **Respond** — simulate the server:
   ```ts
   req.flush(expected);
   ```
7. **Assert result:**
   ```ts
   expect(result).toEqual(expected);
   ```

**Common mistake:** Calling `expectOneScryfallCard` _before_ `.subscribe()`. The request does not exist until you subscribe — you'll get `found none`.

**Common mistake:** Using different IDs in `withId(...)`, `getCardById(...)`, and `expectOneScryfallCard(...)`. Use the same `id` variable everywhere.

**Verify:** The `getCardById` test passes.

**Then immediately do T1b** so the full suite stays green.

**Concepts:** `HttpTestingController`, `req.flush()`, typed mock responses, lazy HTTP

---

## T1b — Collateral fix: CardDetailPage smoke test

**Prerequisites:** App Phase 1 complete (you wired `getCardById` in `card-detail.page.ts`).

**Why this exists:** After App Phase 1, `CardDetailPage` injects `ScryfallApiService` and calls it in `ngOnInit`. The page spec only mocked `ActivatedRoute` — so `should create` fails with:

```
NullInjectorError: No provider for HttpClient!
```

This is **expected**, not a mistake on your part. Component tests need the same dependencies as the component, or mocks for them. Full detail-page testing comes in T5; this is a minimal fix to keep smoke tests passing.

**Files to edit:**

- `src/app/features/card-detail/card-detail.page.spec.ts`

**Goal:** Keep `should create` passing. Leave the other two specs as **`xit`** until T5.

**Steps:**

1. Confirm `should read route param id` and `should load card from service` are still **`xit`** (not `it`).
2. Add a mock `ScryfallApiService` to `providers`:

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

   Returning `of({})` is enough for the smoke test — `ngOnInit` subscribes without error. T5 will use a real card object.

**React comparison:** Same as `jest.mock('../api', () => ({ fetchCard: jest.fn().mockResolvedValue({}) }))` — replace the module at the injector level.

**Verify:** `ng test` green again (all enabled tests pass; skipped tests still skipped).

**Concepts:** Service mocking, `providers` override, `jasmine.createSpy`

---

## T2 — Service tests: searchCards

**Prerequisites:** App Phase 2 (`searchCards` implemented).

**Files to edit:**

- `src/app/core/services/scryfall-api.service.spec.ts`

**Goal:** Un-skip both search tests.

**Hints:**

- Success: `ScryfallListBuilder.create().withDefaultCards(2).build()` for the flushed response
- Subscribe to `searchCards('lightning')` first, then `expectOneScryfallSearch(httpMock, 'lightning')`
- Error test: subscribe, capture request, call `flushScryfallError(req)` for zero-results 404
- Assert the request URL contains the encoded query string

**Verify:** Both search tests pass; suite still green.

**Concepts:** Error response simulation, URL encoding assertions

---

## T3 — Component tests: SearchBar + CardTile

**Prerequisites:** App Phase 3 (search UI components implemented).

**Files to edit:**

- `src/app/features/search/components/search-bar/search-bar.component.spec.ts`
- `src/app/features/search/components/card-tile/card-tile.component.spec.ts`
- `src/app/features/search/components/card-grid/card-grid.component.spec.ts`

**Goal:** Test input/output behavior in isolation — like RTL tests that pass props and assert callbacks.

**Hints:**

- `fixture.componentRef.setInput('card', card)` — sets a signal `input()` from the test (like re-rendering with new props)
- Subscribe to `component.searchQuery.subscribe(...)` or `spyOn` the output emitter
- Query DOM with `fixture.nativeElement.querySelector('img')` — like `container.querySelector`
- Call `fixture.detectChanges()` after changing inputs so the template updates

**Verify:** Component tests pass for bar, tile, and grid.

**Concepts:** `ComponentFixture`, `DebugElement`, signal `input()`/`output()`

---

## T4 — Router tests: query params

**Prerequisites:** App Phase 4 (URL state sync).

**Files to edit:**

- `src/app/features/search/search.page.spec.ts`

**Goal:** Test query param sync and navigation — like testing `useSearchParams` behavior.

**Hints:**

- Use `setupRouterTesting()` and `navigateWithQueryParams()` from `testing/helpers/router-test.helpers.ts`
- Or mock `ActivatedRoute` with `queryParamMap` returning a `ParamMap` stub
- Provide mock `ScryfallApiService` if the search page calls the API on init

**Verify:** Search page reads/writes `q` param correctly.

**Concepts:** `RouterTestingHarness`, query params, `provideRouter`

---

## T5 — Integration: CardDetailPage

**Prerequisites:** App Phase 5 (card detail UI).

**Files to edit:**

- `src/app/features/card-detail/card-detail.page.spec.ts`

**Goal:** Un-skip remaining specs; mock service + route param; assert card renders in the DOM.

**Hints:**

- Expand the T1b mock: `getCardById` returns `of(cardDetailSample)` from `testing/fixtures/`
- `ActivatedRoute` mock already provides `paramMap.get('id')` — assert `cardId` matches
- After `detectChanges()`, query for the card name in the template
- Do not use real HTTP here — mock the service

**Verify:** All three `CardDetailPage` tests pass.

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
- Debounce: wrap in `fakeAsync(() => { ... tick(300); ... })` — like Jest fake timers
- Rate limiter: queue two requests, assert spacing with `tick(RATE_LIMIT_MS)`

**Verify:** All un-skipped stretch tests pass.

**Concepts:** `fakeAsync`, `tick`, timing-sensitive RxJS

---

## Test helpers (already implemented)

You write specs that **use** these — you don't need to build them:

| Helper                    | Location                                    | Purpose                    |
| ------------------------- | ------------------------------------------- | -------------------------- |
| `ScryfallCardBuilder`     | `testing/builders/scryfall-card.builder.ts` | Fluent test card factory   |
| `ScryfallListBuilder`     | `testing/builders/scryfall-list.builder.ts` | Paginated list factory     |
| `expectOneScryfallSearch` | `testing/helpers/http-test.helpers.ts`      | Assert search HTTP call    |
| `expectOneScryfallCard`   | `testing/helpers/http-test.helpers.ts`      | Assert detail HTTP call    |
| `flushScryfallError`      | `testing/helpers/http-test.helpers.ts`      | Simulate 404 error body    |
| `setupRouterTesting`      | `testing/helpers/router-test.helpers.ts`    | RouterTestingHarness setup |
| `navigateWithQueryParams` | `testing/helpers/router-test.helpers.ts`    | Navigate with query string |

---

## Conventions

- `// TODO(test-learn):` — your test task
- `// HINT:` — suggested matcher or setup
- `xit` / `xdescribe` — skipped until ready; **leave these alone** until the matching phase
- Prefer Arrange / Act / Assert in longer tests
- Always mock HTTP in unit tests — never hit real Scryfall

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

---

## Phase checklist (app + test together)

| App phase       | Test phase   | Main thing you prove                         |
| --------------- | ------------ | -------------------------------------------- |
| 0 Orientation   | T0           | Tests run; read a spec file                  |
| 1 `getCardById` | T1 + **T1b** | HTTP service call; mock service in page spec |
| 2 `searchCards` | T2           | Search HTTP + error handling                 |
| 3 Search UI     | T3           | Component inputs/outputs                     |
| 4 URL state     | T4           | Router query params                          |
| 5 Detail UI     | T5           | Page integration with mocked API             |
| 6 Syntax guide  | (optional)   | Smoke tests only unless you add specs        |
| Stretch         | T6           | Timers, cache, debounce                      |
