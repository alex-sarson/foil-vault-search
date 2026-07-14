/** Legal status for a format — see Scryfall card.legalities. */
export type LegalityStatus = 'legal' | 'not_legal' | 'restricted' | 'banned';

/** Known card layout values from Scryfall. Extend as needed. */
export type CardLayout =
  | 'normal'
  | 'split'
  | 'flip'
  | 'transform'
  | 'modal_dfc'
  | 'meld'
  | 'leveler'
  | 'class'
  | 'case'
  | 'saga'
  | 'adventure'
  | 'planar'
  | 'scheme'
  | 'vanguard'
  | 'token'
  | 'double_faced_token'
  | 'emblem'
  | 'mutate'
  | 'prototype'
  | 'battle'
  | 'art_series'
  | 'reversible_card';

export interface ScryfallImageUris {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  art_crop?: string;
  border_crop?: string;
}

export interface ScryfallCardFace {
  object: 'card_face';
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_indicator?: string[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  artist?: string;
  artist_id?: string;
  illustration_id?: string;
  image_uris?: ScryfallImageUris;
  flavor_text?: string;
  printed_name?: string;
  printed_type_line?: string;
  printed_text?: string;
  watermark?: string;
}

export interface ScryfallCard {
  object: 'card';
  id: string;
  oracle_id: string;
  multiverse_ids?: number[];
  mtgo_id?: number;
  arena_id?: number;
  tcgplayer_id?: number;
  cardmarket_id?: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: CardLayout;
  highres_image: boolean;
  image_status: 'missing' | 'placeholder' | 'lowres' | 'highres_scan';
  image_uris?: ScryfallImageUris;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  keywords: string[];
  legalities: Record<string, LegalityStatus>;
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  card_back_id?: string;
  artist: string;
  artist_ids: string[];
  illustration_id?: string;
  border_color: string;
  frame: string;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  edhrec_rank?: number;
  penny_rank?: number;
  prices?: Record<string, string | null>;
  related_uris?: Record<string, string>;
  purchase_uris?: Record<string, string>;
  card_faces?: ScryfallCardFace[];
  /** Present when the card is part of a multi-card meld. */
  all_parts?: Array<{ object: string; id: string; component: string; name: string; type_line: string; uri: string }>;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  produced_mana?: string[];
}

export interface ScryfallList<T> {
  object: 'list';
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: T[];
}

export interface ScryfallError {
  object: 'error';
  code: string;
  status: number;
  details: string;
  type?: string;
  warnings?: string[];
}

export interface SearchOptions {
  /** Sort order — see https://scryfall.com/docs/api/cards/search */
  order?: 'name' | 'set' | 'released' | 'rarity' | 'color' | 'usd' | 'tix' | 'eur' | 'cmc' | 'power' | 'toughness' | 'edhrec' | 'penny' | 'artist' | 'review';
  /** How to deduplicate results — see Scryfall unique= param */
  unique?: 'cards' | 'art' | 'prints';
  /** 1-based page number */
  page?: number;
}
