import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import { ScryfallApiService } from './scryfall-api.service';
import { ScryfallCardBuilder } from '../../testing/builders/scryfall-card.builder';
import { ScryfallCard, ScryfallList } from '../models/scryfall.types';
import {
  expectOneScryfallCard,
  expectOneScryfallSearch,
  flushScryfallError,
} from '../../testing/helpers/http-test.helpers';
import { ScryfallListBuilder } from '../../testing/builders/scryfall-list.builder';

describe('ScryfallApiService', () => {
  let service: ScryfallApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Real service + fake HTTP backend. Do NOT mock ScryfallApiService here —
    // these tests verify the service itself.
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ScryfallApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing searchCards in Phase 2
  it('searchCards should GET /cards/search with encoded query', () => {
    // HINT: use ScryfallListBuilder and expectOneScryfallSearch helper
    const q = 'lightning';
    const expected = ScryfallListBuilder.create().withDefaultCards(2).build();
    let result: ScryfallList<ScryfallCard> | undefined;

    service.searchCards(q).subscribe((list) => (result = list));

    const req = expectOneScryfallSearch(httpMock, q);

    req.flush(expected);
    expect(result).toEqual(expected);
  });

  // TODO(test-learn): Un-skip after implementing searchCards error handling
  it('searchCards should propagate ScryfallError on zero results', () => {
    // HINT: use flushScryfallError helper
    const q = 'zzzzzzzzaaaaaaaaaaa';
    let capturedError: unknown;

    service.searchCards(q).subscribe({
      next: () => fail('expected an error, got success'),
      error: (err) => (capturedError = err),
    });

    const req = expectOneScryfallSearch(httpMock, q);

    flushScryfallError(req);
    expect(capturedError).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing getCardById in Phase 1
  it('getCardById should GET /cards/:id', () => {
    // HINT: use ScryfallCardBuilder and expectOneScryfallCard helper
    const id = 'abc';
    const expected = ScryfallCardBuilder.create().withId(id).build();
    let result: ScryfallCard | undefined;

    service.getCardById(id).subscribe((card) => (result = card));

    const req = expectOneScryfallCard(httpMock, id);

    req.flush(expected);
    expect(result).toEqual(expected);
  });
});
