import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import { ScryfallApiService } from './scryfall-api.service';
import { ScryfallCardBuilder } from '../../testing/builders/scryfall-card.builder';
import { ScryfallCard } from '../models/scryfall.types';
import { expectOneScryfallCard } from '../../testing/helpers/http-test.helpers';

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
