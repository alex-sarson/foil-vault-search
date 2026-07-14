import type Database from 'better-sqlite3';

import { mapCards, type ScryfallCardOut } from '../db/card-mapper.js';
import { queryToSql } from './parser.js';

export const SEARCH_PAGE_SIZE = 175;

export interface SearchResult {
  total_cards: number;
  has_more: boolean;
  data: ScryfallCardOut[];
}

export function searchCards(
  db: Database.Database,
  q: string,
  page = 1,
  order?: string,
): SearchResult {
  const where = queryToSql(q);
  const orderBy = orderClause(order);
  const offset = Math.max(0, (page - 1) * SEARCH_PAGE_SIZE);

  const countRow = db
    .prepare(`SELECT COUNT(*) AS n FROM cards WHERE ${where.sql}`)
    .get(...where.params) as { n: number };
  const total = countRow.n;

  const rows = db
    .prepare(
      `SELECT cards.* FROM cards WHERE ${where.sql} ${orderBy} LIMIT ? OFFSET ?`,
    )
    .all(...where.params, SEARCH_PAGE_SIZE, offset) as Array<
    Record<string, unknown>
  >;

  return {
    total_cards: total,
    has_more: offset + rows.length < total,
    data: mapCards(db, rows),
  };
}

function orderClause(order?: string): string {
  switch (order) {
    case 'set':
      return 'ORDER BY cards.set_code ASC, cards.collector_number ASC';
    case 'released':
      return 'ORDER BY cards.released_at DESC';
    case 'rarity':
      return 'ORDER BY cards.rarity_rank DESC, cards.name_lower ASC';
    case 'color':
      return 'ORDER BY cards.color_count ASC, cards.colors ASC, cards.name_lower ASC';
    case 'usd':
      return 'ORDER BY cards.price_usd IS NULL, cards.price_usd ASC';
    case 'eur':
      return 'ORDER BY cards.price_eur IS NULL, cards.price_eur ASC';
    case 'tix':
      return 'ORDER BY cards.price_tix IS NULL, cards.price_tix ASC';
    case 'cmc':
      return 'ORDER BY cards.cmc ASC, cards.name_lower ASC';
    case 'edhrec':
      return 'ORDER BY cards.edhrec_rank IS NULL, cards.edhrec_rank ASC';
    case 'name':
    default:
      return 'ORDER BY cards.name_lower ASC';
  }
}
