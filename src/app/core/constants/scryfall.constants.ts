/** Scryfall REST API base URL — all HTTP calls go here. */
export const SCRYFALL_API_BASE_URL = 'https://api.scryfall.com';

/** Scryfall returns up to 175 cards per search page. */
export const SEARCH_PAGE_SIZE = 175;

/** Minimum delay between search requests (stretch goal — see SearchRateLimiterService). */
export const RATE_LIMIT_MS = 500;
