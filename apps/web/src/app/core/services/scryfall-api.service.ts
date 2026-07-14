import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import {
  ScryfallCard,
  ScryfallList,
  SearchOptions,
} from '../models/scryfall.types';

import { SCRYFALL_API_BASE_URL } from '../constants/scryfall.constants';

/**
 * HTTP client for the local Scryfall-shaped card API (`SCRYFALL_API_BASE_URL`).
 *
 * @see apps/api/README.md
 * @see EXERCISES.md Phase 1–2
 */
@Injectable({ providedIn: 'root' })
export class ScryfallApiService {
  private readonly http = inject(HttpClient);

  /**
 * Search for cards matching a Scryfall-style query string (served by the local mirror).
 *
 * Endpoint: `GET /cards/search?q=&page=`
 *
 * @see apps/api/README.md
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
    let params = new HttpParams().set('q', query).set('page', page);

    if (options?.order) params = params.set('order', options.order);
    if (options?.unique) params = params.set('unique', options.unique);

    return this.http.get<ScryfallList<ScryfallCard>>(
      `${SCRYFALL_API_BASE_URL}/cards/search`,
      { params },
    );
  }

  /**
   * Fetch a single card by Scryfall UUID from the local mirror.
   *
   * Endpoint: `GET /cards/:id`
   *
   * @see apps/api/README.md
   *
   * TODO(learn): Implement HTTP call — start here in Phase 1.
   * HINT: Return typed Observable<ScryfallCard> from HttpClient.get.
   */
  getCardById(id: string): Observable<ScryfallCard> {
    return this.http.get<ScryfallCard>(`${SCRYFALL_API_BASE_URL}/cards/${id}`);
  }
}
