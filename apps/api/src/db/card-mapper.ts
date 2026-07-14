import type Database from 'better-sqlite3';

export interface ScryfallCardOut {
  object: 'card';
  id: string;
  oracle_id: string;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris?: Record<string, string>;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  keywords: string[];
  legalities: Record<string, string>;
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
  card_faces?: Array<Record<string, unknown>>;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  produced_mana?: string[];
  multiverse_ids?: number[];
  mtgo_id?: number;
  arena_id?: number;
  tcgplayer_id?: number;
  cardmarket_id?: number;
}

type CardRow = Record<string, unknown>;

function parseJsonArray(value: unknown): unknown[] {
  if (typeof value !== 'string' || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function colorsFromJoined(value: unknown): string[] {
  if (typeof value !== 'string' || !value) return [];
  return value.split('').filter(Boolean);
}

function priceStr(n: unknown): string | null {
  if (n === null || n === undefined) return null;
  return String(n);
}

export function mapCardRow(
  db: Database.Database,
  row: CardRow,
): ScryfallCardOut {
  const id = String(row.id);
  const images = db
    .prepare(
      'SELECT face_index, size, uri FROM card_images WHERE card_id = ? ORDER BY face_index, size',
    )
    .all(id) as Array<{ face_index: number; size: string; uri: string }>;

  const image_uris: Record<string, string> = {};
  for (const img of images) {
    if (img.face_index === -1) image_uris[img.size] = img.uri;
  }

  const legalRows = db
    .prepare('SELECT format, status FROM card_legalities WHERE card_id = ?')
    .all(id) as Array<{ format: string; status: string }>;
  const legalities: Record<string, string> = {};
  for (const leg of legalRows) legalities[leg.format] = leg.status;

  const faceRows = db
    .prepare(
      'SELECT * FROM card_faces WHERE card_id = ? ORDER BY face_index ASC',
    )
    .all(id) as Array<Record<string, unknown>>;

  const card_faces =
    faceRows.length === 0
      ? undefined
      : faceRows.map((face) => {
          const faceImages: Record<string, string> = {};
          for (const img of images) {
            if (img.face_index === face.face_index) {
              faceImages[img.size] = img.uri;
            }
          }
          return {
            object: 'card_face',
            name: face.name,
            mana_cost: face.mana_cost ?? '',
            type_line: face.type_line,
            oracle_text: face.oracle_text ?? undefined,
            colors: colorsFromJoined(face.colors),
            color_indicator: colorsFromJoined(face.color_indicator),
            power: face.power ?? undefined,
            toughness: face.toughness ?? undefined,
            loyalty: face.loyalty ?? undefined,
            artist: face.artist ?? undefined,
            artist_id: face.artist_id ?? undefined,
            illustration_id: face.illustration_id ?? undefined,
            image_uris:
              Object.keys(faceImages).length > 0 ? faceImages : undefined,
            flavor_text: face.flavor_text ?? undefined,
            printed_name: face.printed_name ?? undefined,
            printed_type_line: face.printed_type_line ?? undefined,
            printed_text: face.printed_text ?? undefined,
            watermark: face.watermark ?? undefined,
          };
        });

  const out: ScryfallCardOut = {
    object: 'card',
    id,
    oracle_id: String(row.oracle_id),
    name: String(row.name),
    lang: String(row.lang ?? 'en'),
    released_at: String(row.released_at ?? ''),
    uri: String(row.uri ?? ''),
    scryfall_uri: String(row.scryfall_uri ?? ''),
    layout: String(row.layout ?? 'normal'),
    highres_image: Boolean(row.highres_image),
    image_status: String(row.image_status ?? 'highres_scan'),
    mana_cost: row.mana_cost != null ? String(row.mana_cost) : undefined,
    cmc: Number(row.cmc ?? 0),
    type_line: String(row.type_line ?? ''),
    oracle_text: row.oracle_text != null ? String(row.oracle_text) : undefined,
    colors: colorsFromJoined(row.colors),
    color_identity: colorsFromJoined(row.color_identity),
    keywords: parseJsonArray(row.keywords) as string[],
    legalities,
    games: parseJsonArray(row.games) as string[],
    reserved: Boolean(row.reserved),
    foil: Boolean(row.foil),
    nonfoil: Boolean(row.nonfoil),
    finishes: parseJsonArray(row.finishes) as string[],
    oversized: Boolean(row.oversized),
    promo: Boolean(row.promo),
    reprint: Boolean(row.reprint),
    variation: Boolean(row.variation),
    set_id: String(row.set_id ?? ''),
    set: String(row.set_code ?? ''),
    set_name: String(row.set_name ?? ''),
    set_type: String(row.set_type ?? ''),
    set_uri: String(row.set_uri ?? ''),
    set_search_uri: String(row.set_search_uri ?? ''),
    scryfall_set_uri: String(row.scryfall_set_uri ?? ''),
    rulings_uri: String(row.rulings_uri ?? ''),
    prints_search_uri: String(row.prints_search_uri ?? ''),
    collector_number: String(row.collector_number ?? ''),
    digital: Boolean(row.digital),
    rarity: String(row.rarity ?? ''),
    artist: String(row.artist ?? ''),
    artist_ids: parseJsonArray(row.artist_ids) as string[],
    border_color: String(row.border_color ?? 'black'),
    frame: String(row.frame ?? '2015'),
    full_art: Boolean(row.full_art),
    textless: Boolean(row.textless),
    booster: Boolean(row.booster),
    story_spotlight: Boolean(row.story_spotlight),
    prices: {
      usd: priceStr(row.price_usd),
      usd_foil: priceStr(row.price_usd_foil),
      usd_etched: null,
      eur: priceStr(row.price_eur),
      eur_foil: null,
      tix: priceStr(row.price_tix),
    },
  };

  if (Object.keys(image_uris).length) out.image_uris = image_uris;
  if (row.card_back_id) out.card_back_id = String(row.card_back_id);
  if (row.illustration_id) out.illustration_id = String(row.illustration_id);
  if (row.edhrec_rank != null) out.edhrec_rank = Number(row.edhrec_rank);
  if (row.penny_rank != null) out.penny_rank = Number(row.penny_rank);
  if (row.flavor_text) out.flavor_text = String(row.flavor_text);
  if (row.power != null) out.power = String(row.power);
  if (row.toughness != null) out.toughness = String(row.toughness);
  if (row.loyalty != null) out.loyalty = String(row.loyalty);
  if (row.mtgo_id != null) out.mtgo_id = Number(row.mtgo_id);
  if (row.arena_id != null) out.arena_id = Number(row.arena_id);
  if (row.tcgplayer_id != null) out.tcgplayer_id = Number(row.tcgplayer_id);
  if (row.cardmarket_id != null) out.cardmarket_id = Number(row.cardmarket_id);

  const related = parseJsonObject(row.related_uris);
  if (related) out.related_uris = related as Record<string, string>;
  const purchase = parseJsonObject(row.purchase_uris);
  if (purchase) out.purchase_uris = purchase as Record<string, string>;
  const produced = parseJsonArray(row.produced_mana) as string[];
  if (produced.length) out.produced_mana = produced;
  const multiverse = parseJsonArray(row.multiverse_ids) as number[];
  if (multiverse.length) out.multiverse_ids = multiverse;
  if (card_faces) out.card_faces = card_faces;

  return out;
}

export function getCardById(
  db: Database.Database,
  id: string,
): ScryfallCardOut | null {
  const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as
    | CardRow
    | undefined;
  if (!row) return null;
  return mapCardRow(db, row);
}

export function mapCards(
  db: Database.Database,
  rows: CardRow[],
): ScryfallCardOut[] {
  return rows.map((row) => mapCardRow(db, row));
}
