/**
 * Approximate Scryfall search query → SQL WHERE builder.
 *
 * Supported: colors/c/id, types/t, oracle/o, mana/m/cmc/manavalue, rarity/r,
 * set/e/s, format/f/legal, prices usd/eur/tix, name:, OR, negation (-),
 * quoted phrases, bare-word FTS/name match.
 */

export type SqlFragment = { sql: string; params: unknown[] };

export type AstNode =
  | { type: 'and'; children: AstNode[] }
  | { type: 'or'; children: AstNode[] }
  | { type: 'not'; child: AstNode }
  | { type: 'term'; field?: string; op?: string; value: string; exact?: boolean };

const COLOR_MAP: Record<string, string> = {
  w: 'W',
  u: 'U',
  b: 'B',
  r: 'R',
  g: 'G',
  white: 'W',
  blue: 'U',
  black: 'B',
  red: 'R',
  green: 'G',
};

const RARITY_ALIASES: Record<string, string> = {
  c: 'common',
  common: 'common',
  u: 'uncommon',
  uncommon: 'uncommon',
  r: 'rare',
  rare: 'rare',
  m: 'mythic',
  mythic: 'mythic',
  s: 'special',
  special: 'special',
  b: 'bonus',
  bonus: 'bonus',
};

const RARITY_RANK: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  special: 3,
  mythic: 4,
  bonus: 5,
};

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i]!)) i++;
    if (i >= input.length) break;

    if (input[i] === '(' || input[i] === ')') {
      tokens.push(input[i]!);
      i++;
      continue;
    }

    if (input[i] === '"') {
      i++;
      let buf = '"';
      while (i < input.length && input[i] !== '"') {
        buf += input[i];
        i++;
      }
      if (i < input.length && input[i] === '"') {
        buf += '"';
        i++;
      }
      tokens.push(buf);
      continue;
    }

    let buf = '';
    while (
      i < input.length &&
      !/\s/.test(input[i]!) &&
      input[i] !== '(' &&
      input[i] !== ')'
    ) {
      if (input[i] === '"') {
        buf += '"';
        i++;
        while (i < input.length && input[i] !== '"') {
          buf += input[i];
          i++;
        }
        if (i < input.length && input[i] === '"') {
          buf += '"';
          i++;
        }
        continue;
      }
      buf += input[i];
      i++;
    }
    if (buf) tokens.push(buf);
  }
  return tokens;
}

function parseValueToken(raw: string): { value: string; exact: boolean } {
  if (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2) {
    return { value: raw.slice(1, -1), exact: true };
  }
  return { value: raw, exact: false };
}

function splitField(token: string): AstNode {
  // Scryfall exact-name operator: !"Lightning Bolt" or !Shock
  if (token.startsWith('!')) {
    const { value } = parseValueToken(token.slice(1));
    return {
      type: 'term',
      field: 'name',
      op: '=',
      value,
      exact: true,
    };
  }

  const neg = token.startsWith('-');
  const body = neg ? token.slice(1) : token;

  const opMatch = body.match(
    /^([a-zA-Z_]+)\s*(<=|>=|!=|!:|<>|=|<|>|:)\s*(.+)$/,
  );
  let node: AstNode;
  if (opMatch) {
    const field = opMatch[1]!.toLowerCase();
    let op = opMatch[2]!;
    if (op === '!:') op = '!=';
    // Keep ':' distinct from '=' — Scryfall ':' is usually "contains" / soft match
    const { value, exact } = parseValueToken(opMatch[3]!);
    node = { type: 'term', field, op, value, exact };
  } else {
    const { value, exact } = parseValueToken(body);
    node = { type: 'term', value, exact };
  }

  return neg ? { type: 'not', child: node } : node;
}

function parseOr(tokens: string[], index: { i: number }): AstNode {
  const parts: AstNode[] = [parseAnd(tokens, index)];
  while (index.i < tokens.length) {
    const t = tokens[index.i]!.toUpperCase();
    if (t === 'OR') {
      index.i++;
      parts.push(parseAnd(tokens, index));
    } else if (t === ')') {
      break;
    } else {
      break;
    }
  }
  return parts.length === 1 ? parts[0]! : { type: 'or', children: parts };
}

function parseAnd(tokens: string[], index: { i: number }): AstNode {
  const parts: AstNode[] = [];
  while (index.i < tokens.length) {
    const t = tokens[index.i]!;
    const upper = t.toUpperCase();
    if (upper === 'OR' || t === ')') break;
    if (upper === 'AND') {
      index.i++;
      continue;
    }
    parts.push(parseUnary(tokens, index));
  }
  if (parts.length === 0) {
    return { type: 'term', value: '' };
  }
  return parts.length === 1 ? parts[0]! : { type: 'and', children: parts };
}

function parseUnary(tokens: string[], index: { i: number }): AstNode {
  const t = tokens[index.i]!;
  if (t === '(') {
    index.i++;
    const inner = parseOr(tokens, index);
    if (tokens[index.i] === ')') index.i++;
    return inner;
  }
  index.i++;
  return splitField(t);
}

export function parseQuery(q: string): AstNode {
  const tokens = tokenize(q.trim());
  if (tokens.length === 0) return { type: 'term', value: '' };
  return parseOr(tokens, { i: 0 });
}

function likeEscape(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
}

function push(frags: SqlFragment[], frag: SqlFragment | null): void {
  if (frag) frags.push(frag);
}

function colorsIncludeExpr(
  mode: 'colors' | 'identity',
  letters: string[],
  match: 'exact' | 'include' | 'at-most',
): SqlFragment {
  const prefix = mode === 'colors' ? 'is_' : 'ci_';
  const map: Record<string, string> = {
    W: `${prefix}white`,
    U: `${prefix}blue`,
    B: `${prefix}black`,
    R: `${prefix}red`,
    G: `${prefix}green`,
  };
  const set = new Set(letters);
  const parts: string[] = [];
  const params: unknown[] = [];

  if (mode === 'colors' && set.size === 0) {
    return { sql: 'cards.is_colorless = 1', params: [] };
  }

  for (const letter of ['W', 'U', 'B', 'R', 'G']) {
    const col = map[letter]!;
    if (set.has(letter)) {
      parts.push(`cards.${col} = 1`);
    } else if (match === 'exact' || match === 'at-most') {
      parts.push(`cards.${col} = 0`);
    }
  }

  if (match === 'exact' && mode === 'colors') {
    parts.push(`cards.color_count = ${set.size}`);
  }

  return {
    sql: parts.length ? `(${parts.join(' AND ')})` : '1=1',
    params,
  };
}

function parseColorLetters(value: string): {
  letters: string[];
  match: 'exact' | 'include' | 'at-most';
} {
  let v = value.toLowerCase().trim();
  let match: 'exact' | 'include' | 'at-most' = 'include';
  if (v.startsWith('=')) {
    match = 'exact';
    v = v.slice(1);
  } else if (v.startsWith('<=')) {
    match = 'at-most';
    v = v.slice(2);
  } else if (v.startsWith('>')) {
    match = 'include';
    v = v.slice(1);
  }

  if (v === 'c' || v === 'colorless') {
    return { letters: [], match: 'exact' };
  }
  if (v === 'm' || v === 'multicolor') {
    return { letters: ['MULTICOLOR'], match: 'include' };
  }

  const letters: string[] = [];
  // named colors or concatenated wubrg
  if (COLOR_MAP[v] && v.length > 1 && !/^[wubrg]+$/i.test(v)) {
    letters.push(COLOR_MAP[v]!);
  } else {
    for (const ch of v) {
      const mapped = COLOR_MAP[ch];
      if (mapped) letters.push(mapped);
    }
  }
  return { letters: [...new Set(letters)], match };
}

function numericCompare(
  column: string,
  op: string,
  value: string,
): SqlFragment | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return { sql: '0=1', params: [] };
  const allowed = new Set(['=', '!=', '<', '>', '<=', '>=']);
  const useOp = allowed.has(op) ? op : '=';
  return { sql: `cards.${column} ${useOp} ?`, params: [n] };
}

function termToSql(node: Extract<AstNode, { type: 'term' }>): SqlFragment | null {
  if (!node.field && !node.value) return null;

  if (!node.field) {
    const v = node.value.toLowerCase();
    if (!v) return null;
    if (node.exact) {
      return { sql: 'cards.name_lower = ?', params: [v] };
    }
    return {
      sql: `(cards.name_lower LIKE ? ESCAPE '\\' OR cards.type_line_lower LIKE ? ESCAPE '\\' OR cards.oracle_text_lower LIKE ? ESCAPE '\\')`,
      params: [
        `%${likeEscape(v)}%`,
        `%${likeEscape(v)}%`,
        `%${likeEscape(v)}%`,
      ],
    };
  }

  const field = node.field;
  const op = node.op ?? '=';
  const value = node.value;
  const lower = value.toLowerCase();

  switch (field) {
    case 'name':
    case 'n': {
      if (node.exact || op === '=') {
        return {
          sql: 'cards.name_lower = ?',
          params: [lower],
        };
      }
      return {
        sql: `cards.name_lower LIKE ? ESCAPE '\\'`,
        params: [`%${likeEscape(lower)}%`],
      };
    }
    case 'type':
    case 't': {
      return {
        sql: `cards.type_line_lower LIKE ? ESCAPE '\\'`,
        params: [`%${likeEscape(lower)}%`],
      };
    }
    case 'oracle':
    case 'o':
    case 'ft':
    case 'flavor': {
      const col = field === 'ft' || field === 'flavor' ? 'flavor_text' : 'oracle_text_lower';
      if (col === 'flavor_text') {
        return {
          sql: `LOWER(COALESCE(cards.flavor_text,'')) LIKE ? ESCAPE '\\'`,
          params: [`%${likeEscape(lower)}%`],
        };
      }
      return {
        sql: `cards.oracle_text_lower LIKE ? ESCAPE '\\'`,
        params: [`%${likeEscape(lower)}%`],
      };
    }
    case 'color':
    case 'c': {
      const parsed = parseColorLetters(
        op === '='
          ? `=${value}`
          : op === '<=' || op === '<'
            ? `<=${value}`
            : value,
      );
      if (parsed.letters.includes('MULTICOLOR')) {
        return { sql: 'cards.color_count >= 2', params: [] };
      }
      return colorsIncludeExpr('colors', parsed.letters, parsed.match);
    }
    case 'id':
    case 'identity':
    case 'ci': {
      const parsed = parseColorLetters(
        op === '='
          ? `=${value}`
          : op === '<=' || op === '<'
            ? `<=${value}`
            : value,
      );
      if (parsed.letters.includes('MULTICOLOR')) {
        return {
          sql: '(cards.ci_white + cards.ci_blue + cards.ci_black + cards.ci_red + cards.ci_green) >= 2',
          params: [],
        };
      }
      return colorsIncludeExpr('identity', parsed.letters, parsed.match);
    }
    case 'cmc':
    case 'mv':
    case 'manavalue':
      return numericCompare('cmc', op, value);
    case 'pow':
    case 'power':
      return {
        sql: `CAST(cards.power AS REAL) ${op === ':' ? '=' : op} ?`,
        params: [Number(value)],
      };
    case 'tou':
    case 'toughness':
      return {
        sql: `CAST(cards.toughness AS REAL) ${op === ':' ? '=' : op} ?`,
        params: [Number(value)],
      };
    case 'loyalty':
      return {
        sql: `CAST(cards.loyalty AS REAL) ${op === ':' ? '=' : op} ?`,
        params: [Number(value)],
      };
    case 'mana':
    case 'm': {
      const cost = value.toUpperCase();
      return {
        sql: `UPPER(COALESCE(cards.mana_cost,'')) LIKE ? ESCAPE '\\'`,
        params: [`%${likeEscape(cost)}%`],
      };
    }
    case 'rarity':
    case 'r': {
      const rarity = RARITY_ALIASES[lower] ?? lower;
      if (op === '>' || op === '>=' || op === '<' || op === '<=') {
        const rank = RARITY_RANK[rarity];
        if (rank === undefined) return { sql: '0=1', params: [] };
        return { sql: `cards.rarity_rank ${op} ?`, params: [rank] };
      }
      return { sql: 'cards.rarity = ?', params: [rarity] };
    }
    case 'set':
    case 'e':
    case 's':
    case 'edition':
      return { sql: 'LOWER(cards.set_code) = ?', params: [lower] };
    case 'cn':
    case 'number':
      return { sql: 'LOWER(cards.collector_number) = ?', params: [lower] };
    case 'format':
    case 'f':
    case 'legal': {
      const format = lower.replaceAll(' ', '');
      return {
        sql: `EXISTS (
          SELECT 1 FROM card_legalities cl
          WHERE cl.card_id = cards.id AND cl.format = ? AND cl.status = 'legal'
        )`,
        params: [format],
      };
    }
    case 'banned':
      return {
        sql: `EXISTS (
          SELECT 1 FROM card_legalities cl
          WHERE cl.card_id = cards.id AND cl.format = ? AND cl.status = 'banned'
        )`,
        params: [lower],
      };
    case 'restricted':
      return {
        sql: `EXISTS (
          SELECT 1 FROM card_legalities cl
          WHERE cl.card_id = cards.id AND cl.format = ? AND cl.status = 'restricted'
        )`,
        params: [lower],
      };
    case 'usd':
      return numericCompare('price_usd', op, value);
    case 'eur':
      return numericCompare('price_eur', op, value);
    case 'tix':
      return numericCompare('price_tix', op, value);
    case 'is': {
      switch (lower) {
        case 'reserved':
          return { sql: 'cards.reserved = 1', params: [] };
        case 'promo':
          return { sql: 'cards.promo = 1', params: [] };
        case 'digital':
          return { sql: 'cards.digital = 1', params: [] };
        case 'foil':
          return { sql: 'cards.foil = 1', params: [] };
        case 'permanent':
          return {
            sql: `(cards.type_line_lower LIKE '%creature%' OR cards.type_line_lower LIKE '%artifact%' OR cards.type_line_lower LIKE '%enchantment%' OR cards.type_line_lower LIKE '%land%' OR cards.type_line_lower LIKE '%planeswalker%' OR cards.type_line_lower LIKE '%battle%')`,
            params: [],
          };
        case 'spell':
          return {
            sql: `(cards.type_line_lower LIKE '%instant%' OR cards.type_line_lower LIKE '%sorcery%')`,
            params: [],
          };
        default:
          return null;
      }
    }
    case 'year': {
      const year = Number(value);
      if (!Number.isFinite(year)) return { sql: '0=1', params: [] };
      const useOp = op === ':' ? '=' : op;
      if (useOp === '=') {
        return {
          sql: `SUBSTR(COALESCE(cards.released_at,''), 1, 4) = ?`,
          params: [String(year)],
        };
      }
      return {
        sql: `CAST(SUBSTR(COALESCE(cards.released_at,'0'), 1, 4) AS INTEGER) ${useOp} ?`,
        params: [year],
      };
    }
    default:
      // Unknown field: treat as name contains "field:value"
      return {
        sql: `cards.name_lower LIKE ? ESCAPE '\\'`,
        params: [`%${likeEscape(`${field}${value}`.toLowerCase())}%`],
      };
  }
}

export function astToSql(node: AstNode): SqlFragment | null {
  switch (node.type) {
    case 'and': {
      const parts: SqlFragment[] = [];
      for (const child of node.children) push(parts, astToSql(child));
      if (!parts.length) return null;
      return {
        sql: `(${parts.map((p) => p.sql).join(' AND ')})`,
        params: parts.flatMap((p) => p.params),
      };
    }
    case 'or': {
      const parts: SqlFragment[] = [];
      for (const child of node.children) push(parts, astToSql(child));
      if (!parts.length) return null;
      return {
        sql: `(${parts.map((p) => p.sql).join(' OR ')})`,
        params: parts.flatMap((p) => p.params),
      };
    }
    case 'not': {
      const inner = astToSql(node.child);
      if (!inner) return null;
      return { sql: `(NOT (${inner.sql}))`, params: inner.params };
    }
    case 'term':
      return termToSql(node);
  }
}

export function queryToSql(q: string): SqlFragment {
  const ast = parseQuery(q);
  const frag = astToSql(ast);
  if (!frag) return { sql: '1=1', params: [] };
  return frag;
}
