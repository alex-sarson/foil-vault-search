import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Queues search requests to respect Scryfall rate limits (stretch goal).
 *
 * @see EXERCISES.md — Stretch goals
 * @see RATE_LIMIT_MS in scryfall.constants.ts
 */
@Injectable({ providedIn: 'root' })
export class SearchRateLimiterService {
  /**
   * TODO(learn): Wrap an Observable factory so calls are spaced by RATE_LIMIT_MS.
   * HINT: Consider concatMap + timer, or a simple queue with delay between emissions.
   */
  schedule<T>(request: () => Observable<T>): Observable<T> {
    return request();
  }
}
