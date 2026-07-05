import { TestBed } from '@angular/core/testing';

import { CardCacheService } from './card-cache.service';
import { ScryfallCardBuilder } from '../../testing/builders/scryfall-card.builder';

describe('CardCacheService', () => {
  let service: CardCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing cache (stretch goal)
  xit('get should return cached card by id', () => {
    fail('TODO: Implement this test');
  });

  xit('set should store a card', () => {
    const card = ScryfallCardBuilder.create().withId('abc').build();
    service.set('abc', card);
    fail('TODO: Assert get returns the card');
  });

  xit('evict should remove a single entry', () => {
    fail('TODO: Implement this test');
  });
});
