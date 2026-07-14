/**
 * Local Scryfall mirror (started by `pnpm start` via apps/api).
 * Same path shapes as Scryfall (`/cards/search`, `/cards/:id`).
 */
export const SCRYFALL_API_BASE_URL = 'http://localhost:3000';

/** Local API returns up to 175 cards per search page (Scryfall-compatible). */
export const SEARCH_PAGE_SIZE = 175;

/**
 * Optional client-side spacing between search requests (stretch goal).
 * Not required against the local API — useful if you ever point at production Scryfall.
 */
export const RATE_LIMIT_MS = 500;
