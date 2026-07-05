import { HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { SCRYFALL_API_BASE_URL } from '../../core/constants/scryfall.constants';
import { ScryfallError } from '../../core/models/scryfall.types';

/** Assert a single Scryfall search request and return the TestRequest. */
export function expectOneScryfallSearch(
  httpMock: HttpTestingController,
  query: string,
  page = 1,
): TestRequest {
  const encodedQuery = encodeURIComponent(query);
  const url = `${SCRYFALL_API_BASE_URL}/cards/search?q=${encodedQuery}&page=${page}`;
  return httpMock.expectOne((req) => req.url.includes('/cards/search') && req.url.includes(encodedQuery));
}

/** Assert a single Scryfall card-by-id request and return the TestRequest. */
export function expectOneScryfallCard(httpMock: HttpTestingController, id: string): TestRequest {
  const url = `${SCRYFALL_API_BASE_URL}/cards/${id}`;
  return httpMock.expectOne(url);
}

/** Flush a ScryfallError body (e.g. zero search results). */
export function flushScryfallError(
  req: TestRequest,
  message = 'No cards found matching your query',
  status = 404,
): void {
  const body: ScryfallError = {
    object: 'error',
    code: 'not_found',
    status,
    details: message,
  };
  req.flush(body, { status, statusText: 'Not Found' });
}
