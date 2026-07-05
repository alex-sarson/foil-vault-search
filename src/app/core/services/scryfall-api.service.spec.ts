import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ScryfallApiService } from './scryfall-api.service';

describe('ScryfallApiService', () => {
  let service: ScryfallApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
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
  xit('searchCards should GET /cards/search with encoded query', () => {
    // HINT: use ScryfallListBuilder and expectOneScryfallSearch helper
    fail('TODO: Implement this test');
  });

  // TODO(test-learn): Un-skip after implementing searchCards error handling
  xit('searchCards should propagate ScryfallError on zero results', () => {
    // HINT: use flushScryfallError helper
    fail('TODO: Implement this test');
  });

  // TODO(test-learn): Un-skip after implementing getCardById in Phase 1
  xit('getCardById should GET /cards/:id', () => {
    // HINT: use ScryfallCardBuilder and expectOneScryfallCard helper
    fail('TODO: Implement this test');
  });
});
