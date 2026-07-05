import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ScryfallCard, ScryfallList, SearchOptions } from '../models/scryfall.types';

/**
 * HTTP client for the Scryfall REST API.
 *
 * @see https://scryfall.com/docs/api
 * @see EXERCISES.md Phase 1–2
 */
@Injectable({ providedIn: 'root' })
export class ScryfallApiService {
  private readonly http = inject(HttpClient);

  /**
   * Search for cards matching a Scryfall query string.
   *
   * Endpoint: `GET /cards/search?q=&page=`
   * Rate limit: ~2 requests/sec — consider debounceTime + SearchRateLimiterService.
   *
   * @see https://scryfall.com/docs/api/cards/search
   *
   * TODO(learn): Implement HTTP call. Encode `query` with encodeURIComponent.
   * HINT: Zero results returns a ScryfallError (404), not an empty list — handle in caller or here.
   * HINT: Use switchMap in the search page to cancel in-flight requests.
   */
  searchCards(
    query: string,
    page = 1,
    options?: SearchOptions,
  ): Observable<ScryfallList<ScryfallCard>> {
    return throwError(() => new Error('TODO: Implement searchCards'));
  }

  /**
   * Fetch a single card by Scryfall UUID.
   *
   * Endpoint: `GET /cards/:id`
   * Rate limit: ~10 requests/sec.
   *
   * @see https://scryfall.com/docs/api/cards/id
   *
   * TODO(learn): Implement HTTP call — start here in Phase 1.
   * HINT: Return typed Observable<ScryfallCard> from HttpClient.get.
   */
  getCardById(id: string): Observable<ScryfallCard> {
    return throwError(() => new Error('TODO: Implement getCardById'));
  }
}
