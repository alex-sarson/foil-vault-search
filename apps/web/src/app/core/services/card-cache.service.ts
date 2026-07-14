import { Injectable } from '@angular/core';

import { ScryfallCard } from '../models/scryfall.types';

/**
 * In-memory LRU cache for card detail lookups (stretch goal).
 *
 * @see EXERCISES.md — Stretch goals
 */
@Injectable({ providedIn: 'root' })
export class CardCacheService {
  /**
   * TODO(learn): Return cached card by id, or undefined if missing/expired.
   * HINT: Use a Map<string, ScryfallCard> and optionally track access order for LRU eviction.
   */
  get(id: string): ScryfallCard | undefined {
    return undefined;
  }

  /**
   * TODO(learn): Store a card in the cache.
   */
  set(id: string, card: ScryfallCard): void {
    // stub
  }

  /**
   * TODO(learn): Remove a single entry or clear the entire cache.
   */
  evict(id?: string): void {
    // stub
  }
}
