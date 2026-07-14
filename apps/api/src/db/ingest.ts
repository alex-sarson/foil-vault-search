import type Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { createGunzip } from 'node:zlib';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
import { Readable } from 'node:stream';

import {
  API_DATA_DIR,
  createSchema,
  DB_PATH,
  DUMP_CANDIDATES,
  REPO_DATA_DIR,
  cardCount,
} from './schema.js';

const USER_AGENT = 'foil-vault-search/0.0.0 (local learning mirror; contact: local-dev)';
const PAGE_ACCEPT = 'application/json;q=0.9,*/*;q=0.8';

const RARITY_RANK: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  special: 3,
  mythic: 4,
  bonus: 5,
};

type BulkCard = Record<string, unknown>;

function colorFlags(colors: string[] | undefined): {
  is_white: number;
  is_blue: number;
  is_black: number;
  is_red: number;
  is_green: number;
  is_colorless: number;
  color_count: number;
  colors: string;
} {
  const set = new Set((colors ?? []).map((c) => c.toUpperCase()));
  const is_white = set.has('W') ? 1 : 0;
  const is_blue = set.has('U') ? 1 : 0;
  const is_black = set.has('B') ? 1 : 0;
  const is_red = set.has('R') ? 1 : 0;
  const is_green = set.has('G') ? 1 : 0;
  const color_count = is_white + is_blue + is_black + is_red + is_green;
  return {
    is_white,
    is_blue,
    is_black,
    is_red,
    is_green,
    is_colorless: color_count === 0 ? 1 : 0,
    color_count,
    colors: [...set].join(''),
  };
}

function identityFlags(ci: string[] | undefined) {
  const set = new Set((ci ?? []).map((c) => c.toUpperCase()));
  return {
    ci_white: set.has('W') ? 1 : 0,
    ci_blue: set.has('U') ? 1 : 0,
    ci_black: set.has('B') ? 1 : 0,
    ci_red: set.has('R') ? 1 : 0,
    ci_green: set.has('G') ? 1 : 0,
    color_identity: [...set].join(''),
  };
}

function jsonOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function boolInt(value: unknown): number {
  return value ? 1 : 0;
}

function numOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function scryfallFetch(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: PAGE_ACCEPT,
    },
  });
  if (!res.ok) {
    throw new Error(`Scryfall request failed ${res.status} ${url}`);
  }
  return res;
}

async function downloadBulkJsonl(destGz: string): Promise<void> {
  console.log('[ingest] Fetching bulk-data/oracle-cards metadata…');
  const metaRes = await scryfallFetch(
    'https://api.scryfall.com/bulk-data/oracle-cards',
  );
  const meta = (await metaRes.json()) as {
    jsonl_download_uri?: string;
    download_uri?: string;
  };
  const downloadUri = meta.jsonl_download_uri ?? meta.download_uri;
  if (!downloadUri) {
    throw new Error('No download URI on oracle-cards bulk object');
  }

  console.log('[ingest] Downloading oracle-cards bulk…');
  const fileRes = await scryfallFetch(downloadUri);
  if (!fileRes.body) {
    throw new Error('Empty bulk download body');
  }

  await pipeline(
    Readable.fromWeb(fileRes.body as import('node:stream/web').ReadableStream),
    createWriteStream(destGz),
  );
  console.log(`[ingest] Saved ${destGz}`);
}

function insertCard(db: Database.Database, card: BulkCard): void {
  const colors = colorFlags(card.colors as string[] | undefined);
  const identity = identityFlags(card.color_identity as string[] | undefined);
  const name = String(card.name ?? '');
  const typeLine = String(card.type_line ?? '');
  const oracleText = card.oracle_text != null ? String(card.oracle_text) : '';
  const rarity = String(card.rarity ?? '');
  const prices = (card.prices ?? {}) as Record<string, string | null>;

  db.prepare(
    `INSERT OR REPLACE INTO cards (
      id, oracle_id, name, name_lower, lang, released_at, uri, scryfall_uri,
      layout, highres_image, image_status, mana_cost, cmc, type_line, oracle_text,
      power, toughness, loyalty, colors, color_identity, keywords, games,
      reserved, foil, nonfoil, finishes, oversized, promo, reprint, variation,
      set_id, set_code, set_name, set_type, set_uri, set_search_uri, scryfall_set_uri,
      rulings_uri, prints_search_uri, collector_number, digital, rarity, card_back_id,
      artist, artist_ids, illustration_id, border_color, frame, full_art, textless,
      booster, story_spotlight, edhrec_rank, penny_rank, price_usd, price_usd_foil,
      price_eur, price_tix, flavor_text, produced_mana, related_uris, purchase_uris,
      multiverse_ids, mtgo_id, arena_id, tcgplayer_id, cardmarket_id,
      is_white, is_blue, is_black, is_red, is_green, is_colorless, color_count,
      ci_white, ci_blue, ci_black, ci_red, ci_green,
      type_line_lower, oracle_text_lower, rarity_rank
    ) VALUES (
      @id, @oracle_id, @name, @name_lower, @lang, @released_at, @uri, @scryfall_uri,
      @layout, @highres_image, @image_status, @mana_cost, @cmc, @type_line, @oracle_text,
      @power, @toughness, @loyalty, @colors, @color_identity, @keywords, @games,
      @reserved, @foil, @nonfoil, @finishes, @oversized, @promo, @reprint, @variation,
      @set_id, @set_code, @set_name, @set_type, @set_uri, @set_search_uri, @scryfall_set_uri,
      @rulings_uri, @prints_search_uri, @collector_number, @digital, @rarity, @card_back_id,
      @artist, @artist_ids, @illustration_id, @border_color, @frame, @full_art, @textless,
      @booster, @story_spotlight, @edhrec_rank, @penny_rank, @price_usd, @price_usd_foil,
      @price_eur, @price_tix, @flavor_text, @produced_mana, @related_uris, @purchase_uris,
      @multiverse_ids, @mtgo_id, @arena_id, @tcgplayer_id, @cardmarket_id,
      @is_white, @is_blue, @is_black, @is_red, @is_green, @is_colorless, @color_count,
      @ci_white, @ci_blue, @ci_black, @ci_red, @ci_green,
      @type_line_lower, @oracle_text_lower, @rarity_rank
    )`,
  ).run({
    id: card.id,
    oracle_id: card.oracle_id ?? card.id,
    name,
    name_lower: name.toLowerCase(),
    lang: card.lang ?? null,
    released_at: card.released_at ?? null,
    uri: card.uri ?? null,
    scryfall_uri: card.scryfall_uri ?? null,
    layout: card.layout ?? null,
    highres_image: boolInt(card.highres_image),
    image_status: card.image_status ?? null,
    mana_cost: card.mana_cost ?? null,
    cmc: Number(card.cmc ?? 0),
    type_line: typeLine,
    oracle_text: oracleText || null,
    power: card.power ?? null,
    toughness: card.toughness ?? null,
    loyalty: card.loyalty ?? null,
    colors: colors.colors,
    color_identity: identity.color_identity,
    keywords: JSON.stringify(card.keywords ?? []),
    games: JSON.stringify(card.games ?? []),
    reserved: boolInt(card.reserved),
    foil: boolInt(card.foil),
    nonfoil: boolInt(card.nonfoil),
    finishes: JSON.stringify(card.finishes ?? []),
    oversized: boolInt(card.oversized),
    promo: boolInt(card.promo),
    reprint: boolInt(card.reprint),
    variation: boolInt(card.variation),
    set_id: card.set_id ?? null,
    set_code: card.set ?? null,
    set_name: card.set_name ?? null,
    set_type: card.set_type ?? null,
    set_uri: card.set_uri ?? null,
    set_search_uri: card.set_search_uri ?? null,
    scryfall_set_uri: card.scryfall_set_uri ?? null,
    rulings_uri: card.rulings_uri ?? null,
    prints_search_uri: card.prints_search_uri ?? null,
    collector_number: card.collector_number ?? null,
    digital: boolInt(card.digital),
    rarity,
    card_back_id: card.card_back_id ?? null,
    artist: card.artist ?? null,
    artist_ids: JSON.stringify(card.artist_ids ?? []),
    illustration_id: card.illustration_id ?? null,
    border_color: card.border_color ?? null,
    frame: card.frame ?? null,
    full_art: boolInt(card.full_art),
    textless: boolInt(card.textless),
    booster: boolInt(card.booster),
    story_spotlight: boolInt(card.story_spotlight),
    edhrec_rank: numOrNull(card.edhrec_rank),
    penny_rank: numOrNull(card.penny_rank),
    price_usd: numOrNull(prices.usd),
    price_usd_foil: numOrNull(prices.usd_foil),
    price_eur: numOrNull(prices.eur),
    price_tix: numOrNull(prices.tix),
    flavor_text: card.flavor_text ?? null,
    produced_mana: jsonOrNull(card.produced_mana),
    related_uris: jsonOrNull(card.related_uris),
    purchase_uris: jsonOrNull(card.purchase_uris),
    multiverse_ids: jsonOrNull(card.multiverse_ids),
    mtgo_id: numOrNull(card.mtgo_id),
    arena_id: numOrNull(card.arena_id),
    tcgplayer_id: numOrNull(card.tcgplayer_id),
    cardmarket_id: card.cardmarket_id != null ? String(card.cardmarket_id) : null,
    is_white: colors.is_white,
    is_blue: colors.is_blue,
    is_black: colors.is_black,
    is_red: colors.is_red,
    is_green: colors.is_green,
    is_colorless: colors.is_colorless,
    color_count: colors.color_count,
    ci_white: identity.ci_white,
    ci_blue: identity.ci_blue,
    ci_black: identity.ci_black,
    ci_red: identity.ci_red,
    ci_green: identity.ci_green,
    type_line_lower: typeLine.toLowerCase(),
    oracle_text_lower: oracleText.toLowerCase(),
    rarity_rank: RARITY_RANK[rarity] ?? 0,
  });

  const cardId = String(card.id);
  db.prepare('DELETE FROM card_faces WHERE card_id = ?').run(cardId);
  db.prepare('DELETE FROM card_legalities WHERE card_id = ?').run(cardId);
  db.prepare('DELETE FROM card_images WHERE card_id = ?').run(cardId);
  db.prepare('DELETE FROM cards_fts WHERE card_id = ?').run(cardId);

  const faces = card.card_faces as Array<Record<string, unknown>> | undefined;
  if (faces?.length) {
    const insertFace = db.prepare(
      `INSERT INTO card_faces (
        card_id, face_index, name, mana_cost, type_line, oracle_text, colors,
        color_indicator, power, toughness, loyalty, artist, artist_id,
        illustration_id, flavor_text, printed_name, printed_type_line,
        printed_text, watermark
      ) VALUES (
        @card_id, @face_index, @name, @mana_cost, @type_line, @oracle_text, @colors,
        @color_indicator, @power, @toughness, @loyalty, @artist, @artist_id,
        @illustration_id, @flavor_text, @printed_name, @printed_type_line,
        @printed_text, @watermark
      )`,
    );
    faces.forEach((face, face_index) => {
      insertFace.run({
        card_id: cardId,
        face_index,
        name: face.name ?? null,
        mana_cost: face.mana_cost ?? null,
        type_line: face.type_line ?? null,
        oracle_text: face.oracle_text ?? null,
        colors: Array.isArray(face.colors) ? (face.colors as string[]).join('') : null,
        color_indicator: Array.isArray(face.color_indicator)
          ? (face.color_indicator as string[]).join('')
          : null,
        power: face.power ?? null,
        toughness: face.toughness ?? null,
        loyalty: face.loyalty ?? null,
        artist: face.artist ?? null,
        artist_id: face.artist_id ?? null,
        illustration_id: face.illustration_id ?? null,
        flavor_text: face.flavor_text ?? null,
        printed_name: face.printed_name ?? null,
        printed_type_line: face.printed_type_line ?? null,
        printed_text: face.printed_text ?? null,
        watermark: face.watermark ?? null,
      });

      const faceImages = face.image_uris as Record<string, string> | undefined;
      if (faceImages) {
        const insertImg = db.prepare(
          'INSERT INTO card_images (card_id, face_index, size, uri) VALUES (?, ?, ?, ?)',
        );
        for (const [size, uri] of Object.entries(faceImages)) {
          insertImg.run(cardId, face_index, size, uri);
        }
      }
    });
  }

  const imageUris = card.image_uris as Record<string, string> | undefined;
  if (imageUris) {
    const insertImg = db.prepare(
      'INSERT INTO card_images (card_id, face_index, size, uri) VALUES (?, ?, ?, ?)',
    );
    for (const [size, uri] of Object.entries(imageUris)) {
      insertImg.run(cardId, -1, size, uri);
    }
  }

  const legalities = card.legalities as Record<string, string> | undefined;
  if (legalities) {
    const insertLeg = db.prepare(
      'INSERT INTO card_legalities (card_id, format, status) VALUES (?, ?, ?)',
    );
    for (const [format, status] of Object.entries(legalities)) {
      insertLeg.run(cardId, format, status);
    }
  }

  db.prepare(
    'INSERT INTO cards_fts (card_id, name, type_line, oracle_text) VALUES (?, ?, ?, ?)',
  ).run(cardId, name, typeLine, oracleText);
}

async function shredJsonl(db: Database.Database, gzPath: string): Promise<number> {
  createSchema(db);
  db.exec('DELETE FROM cards_fts');
  db.exec('DELETE FROM card_images');
  db.exec('DELETE FROM card_legalities');
  db.exec('DELETE FROM card_faces');
  db.exec('DELETE FROM cards');

  const insertMany = db.transaction((cards: BulkCard[]) => {
    for (const card of cards) insertCard(db, card);
  });

  const rl = createInterface({
    input: createReadStream(gzPath).pipe(createGunzip()),
    crlfDelay: Infinity,
  });

  let buffer: BulkCard[] = [];
  let total = 0;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Support both JSONL and legacy JSON-array streams (line may be `[` `]` `,`)
    if (trimmed === '[' || trimmed === ']' || trimmed === ',') continue;
    const jsonLine = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed;
    try {
      buffer.push(JSON.parse(jsonLine) as BulkCard);
    } catch {
      continue;
    }
    if (buffer.length >= 200) {
      insertMany(buffer);
      total += buffer.length;
      buffer = [];
      if (total % 2000 === 0) console.log(`[ingest] Shredded ${total} cards…`);
    }
  }
  if (buffer.length) {
    insertMany(buffer);
    total += buffer.length;
  }
  return total;
}

export function writeSqlDump(db: Database.Database, dumpPath: string): void {
  console.log(`[ingest] Writing SQL dump to ${dumpPath}…`);
  fs.mkdirSync(path.dirname(dumpPath), { recursive: true });
  const tmp = `${dumpPath}.tmp`;
  const fh = fs.openSync(tmp, 'w');
  fs.writeSync(fh, 'PRAGMA foreign_keys=OFF;\nBEGIN;\n');
  const tables = [
    'cards',
    'card_faces',
    'card_legalities',
    'card_images',
  ];
  for (const table of tables) {
    const create = db
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`)
      .get(table) as { sql: string } | undefined;
    if (create?.sql) {
      fs.writeSync(fh, `DROP TABLE IF EXISTS ${table};\n`);
      fs.writeSync(fh, `${create.sql};\n`);
    }
    const cols = (
      db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
    ).map((c) => c.name);
    const stmt = db.prepare(`SELECT * FROM ${table}`);
    for (const row of stmt.iterate() as IterableIterator<Record<string, unknown>>) {
      const values = cols.map((col) => sqlLiteral(row[col]));
      fs.writeSync(
        fh,
        `INSERT INTO ${table} (${cols.join(',')}) VALUES (${values.join(',')});\n`,
      );
    }
  }
  fs.writeSync(
    fh,
    `DROP TABLE IF EXISTS cards_fts;
CREATE VIRTUAL TABLE cards_fts USING fts5(
  card_id UNINDEXED,
  name,
  type_line,
  oracle_text,
  tokenize = 'porter unicode61'
);
INSERT INTO cards_fts (card_id, name, type_line, oracle_text)
  SELECT id, name, type_line, COALESCE(oracle_text, '') FROM cards;
CREATE INDEX IF NOT EXISTS idx_cards_name_lower ON cards(name_lower);
CREATE INDEX IF NOT EXISTS idx_cards_set_code ON cards(set_code);
CREATE INDEX IF NOT EXISTS idx_cards_cmc ON cards(cmc);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_type_line_lower ON cards(type_line_lower);
CREATE INDEX IF NOT EXISTS idx_legalities_format_status ON card_legalities(format, status);
COMMIT;
PRAGMA foreign_keys=ON;
`,
  );
  fs.closeSync(fh);
  fs.renameSync(tmp, dumpPath);
  console.log(`[ingest] Dump written (${dumpPath})`);
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'bigint') return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function restoreFromDump(db: Database.Database, dumpPath: string): void {
  console.log(`[ingest] Restoring from SQL dump ${dumpPath}…`);
  const sql = fs.readFileSync(dumpPath, 'utf8');
  db.exec('PRAGMA foreign_keys = OFF');
  db.exec(sql);
  db.exec('PRAGMA foreign_keys = ON');
  console.log(`[ingest] Restored ${cardCount(db)} cards from dump`);
}

export async function ensureDatabase(db: Database.Database): Promise<void> {
  createSchema(db);
  const existing = cardCount(db);
  if (existing > 0) {
    console.log(`[ingest] Using existing DB with ${existing} cards`);
    return;
  }

  const dumpPath = DUMP_CANDIDATES.find((p) => fs.existsSync(p));
  if (dumpPath) {
    restoreFromDump(db, dumpPath);
    if (cardCount(db) > 0) return;
  }

  const bulkDir = path.join(API_DATA_DIR, 'bulk');
  fs.mkdirSync(bulkDir, { recursive: true });
  const gzPath = path.join(bulkDir, 'oracle-cards.jsonl.gz');
  await downloadBulkJsonl(gzPath);
  console.log('[ingest] Shredding bulk into SQLite…');
  const total = await shredJsonl(db, gzPath);
  console.log(`[ingest] Shredded ${total} cards`);
  if (process.env.FOIL_WRITE_SQL_DUMP === '1') {
    const outDump = path.join(REPO_DATA_DIR, 'cards.sql');
    writeSqlDump(db, outDump);
  } else {
    console.log(
      '[ingest] Skipping SQL dump (set FOIL_WRITE_SQL_DUMP=1 to write data/cards.sql). DB file will be reused on next boot.',
    );
  }
}
