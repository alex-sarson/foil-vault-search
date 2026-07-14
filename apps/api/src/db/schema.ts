import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to apps/api/data */
export const API_DATA_DIR = path.resolve(__dirname, '../../data');

/** Repo-root data/ folder (optional cards.sql dump) */
export const REPO_DATA_DIR = path.resolve(__dirname, '../../../../data');

export const DB_PATH = path.join(API_DATA_DIR, 'cards.db');

export const DUMP_CANDIDATES = [
  path.join(REPO_DATA_DIR, 'cards.sql'),
  path.join(API_DATA_DIR, 'cards.sql'),
];

export function ensureDataDirs(): void {
  fs.mkdirSync(API_DATA_DIR, { recursive: true });
  fs.mkdirSync(REPO_DATA_DIR, { recursive: true });
}

export function openDatabase(dbPath = DB_PATH): Database.Database {
  ensureDataDirs();
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
  return db;
}

export function createSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      oracle_id TEXT NOT NULL,
      name TEXT NOT NULL,
      name_lower TEXT NOT NULL,
      lang TEXT,
      released_at TEXT,
      uri TEXT,
      scryfall_uri TEXT,
      layout TEXT,
      highres_image INTEGER NOT NULL DEFAULT 0,
      image_status TEXT,
      mana_cost TEXT,
      cmc REAL NOT NULL DEFAULT 0,
      type_line TEXT,
      oracle_text TEXT,
      power TEXT,
      toughness TEXT,
      loyalty TEXT,
      colors TEXT NOT NULL DEFAULT '',
      color_identity TEXT NOT NULL DEFAULT '',
      keywords TEXT NOT NULL DEFAULT '[]',
      games TEXT NOT NULL DEFAULT '[]',
      reserved INTEGER NOT NULL DEFAULT 0,
      foil INTEGER NOT NULL DEFAULT 0,
      nonfoil INTEGER NOT NULL DEFAULT 1,
      finishes TEXT NOT NULL DEFAULT '[]',
      oversized INTEGER NOT NULL DEFAULT 0,
      promo INTEGER NOT NULL DEFAULT 0,
      reprint INTEGER NOT NULL DEFAULT 0,
      variation INTEGER NOT NULL DEFAULT 0,
      set_id TEXT,
      set_code TEXT,
      set_name TEXT,
      set_type TEXT,
      set_uri TEXT,
      set_search_uri TEXT,
      scryfall_set_uri TEXT,
      rulings_uri TEXT,
      prints_search_uri TEXT,
      collector_number TEXT,
      digital INTEGER NOT NULL DEFAULT 0,
      rarity TEXT,
      card_back_id TEXT,
      artist TEXT,
      artist_ids TEXT NOT NULL DEFAULT '[]',
      illustration_id TEXT,
      border_color TEXT,
      frame TEXT,
      full_art INTEGER NOT NULL DEFAULT 0,
      textless INTEGER NOT NULL DEFAULT 0,
      booster INTEGER NOT NULL DEFAULT 0,
      story_spotlight INTEGER NOT NULL DEFAULT 0,
      edhrec_rank INTEGER,
      penny_rank INTEGER,
      price_usd REAL,
      price_usd_foil REAL,
      price_eur REAL,
      price_tix REAL,
      flavor_text TEXT,
      produced_mana TEXT,
      related_uris TEXT,
      purchase_uris TEXT,
      multiverse_ids TEXT,
      mtgo_id INTEGER,
      arena_id INTEGER,
      tcgplayer_id INTEGER,
      cardmarket_id TEXT,
      is_white INTEGER NOT NULL DEFAULT 0,
      is_blue INTEGER NOT NULL DEFAULT 0,
      is_black INTEGER NOT NULL DEFAULT 0,
      is_red INTEGER NOT NULL DEFAULT 0,
      is_green INTEGER NOT NULL DEFAULT 0,
      is_colorless INTEGER NOT NULL DEFAULT 0,
      color_count INTEGER NOT NULL DEFAULT 0,
      ci_white INTEGER NOT NULL DEFAULT 0,
      ci_blue INTEGER NOT NULL DEFAULT 0,
      ci_black INTEGER NOT NULL DEFAULT 0,
      ci_red INTEGER NOT NULL DEFAULT 0,
      ci_green INTEGER NOT NULL DEFAULT 0,
      type_line_lower TEXT,
      oracle_text_lower TEXT,
      rarity_rank INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS card_faces (
      card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      face_index INTEGER NOT NULL,
      name TEXT,
      mana_cost TEXT,
      type_line TEXT,
      oracle_text TEXT,
      colors TEXT,
      color_indicator TEXT,
      power TEXT,
      toughness TEXT,
      loyalty TEXT,
      artist TEXT,
      artist_id TEXT,
      illustration_id TEXT,
      flavor_text TEXT,
      printed_name TEXT,
      printed_type_line TEXT,
      printed_text TEXT,
      watermark TEXT,
      PRIMARY KEY (card_id, face_index)
    );

    CREATE TABLE IF NOT EXISTS card_legalities (
      card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      format TEXT NOT NULL,
      status TEXT NOT NULL,
      PRIMARY KEY (card_id, format)
    );

    CREATE TABLE IF NOT EXISTS card_images (
      card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      face_index INTEGER NOT NULL DEFAULT -1,
      size TEXT NOT NULL,
      uri TEXT NOT NULL,
      PRIMARY KEY (card_id, face_index, size)
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(
      card_id UNINDEXED,
      name,
      type_line,
      oracle_text,
      tokenize = 'porter unicode61'
    );

    CREATE INDEX IF NOT EXISTS idx_cards_name_lower ON cards(name_lower);
    CREATE INDEX IF NOT EXISTS idx_cards_set_code ON cards(set_code);
    CREATE INDEX IF NOT EXISTS idx_cards_cmc ON cards(cmc);
    CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
    CREATE INDEX IF NOT EXISTS idx_cards_type_line_lower ON cards(type_line_lower);
    CREATE INDEX IF NOT EXISTS idx_legalities_format_status ON card_legalities(format, status);
  `);
}

export function cardCount(db: Database.Database): number {
  try {
    const row = db.prepare('SELECT COUNT(*) AS n FROM cards').get() as
      | { n: number }
      | undefined;
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}
