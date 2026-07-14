import { HttpInterceptorFn } from '@angular/common/http';

import { SCRYFALL_API_BASE_URL } from '../constants/scryfall.constants';

/**
 * Optional HTTP interceptor for local mirror requests (`SCRYFALL_API_BASE_URL`).
 *
 * TODO(learn): Add Accept header or logging if needed.
 * HINT: Browser HttpClient usually sets Accept automatically — only customize if required.
 */
export const scryfallInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(SCRYFALL_API_BASE_URL)) {
    // TODO(learn): Clone request with headers if needed
    // req = req.clone({ setHeaders: { Accept: 'application/json' } });
  }
  return next(req);
};
