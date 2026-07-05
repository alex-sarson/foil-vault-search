import { HttpInterceptorFn } from '@angular/common/http';

import { SCRYFALL_API_BASE_URL } from '../constants/scryfall.constants';

/**
 * Optional HTTP interceptor for Scryfall requests.
 *
 * TODO(learn): Add Accept header or logging if needed.
 * HINT: Browser HttpClient usually sets Accept automatically — only customize if required.
 *
 * @see https://scryfall.com/docs/api
 */
export const scryfallInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(SCRYFALL_API_BASE_URL)) {
    // TODO(learn): Clone request with headers if needed
    // req = req.clone({ setHeaders: { Accept: 'application/json' } });
  }
  return next(req);
};
