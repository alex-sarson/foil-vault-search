import { TestBed } from '@angular/core/testing';

import { SearchRateLimiterService } from './search-rate-limiter.service';

describe('SearchRateLimiterService', () => {
  let service: SearchRateLimiterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchRateLimiterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing rate limiter (stretch goal)
  xit('schedule should space requests by RATE_LIMIT_MS', () => {
    // HINT: use fakeAsync + tick
    fail('TODO: Implement this test');
  });
});
