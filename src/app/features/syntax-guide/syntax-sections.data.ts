export interface SyntaxSection {
  id: string;
  title: string;
  /** TODO(learn): Add description for each section */
  description?: string;
  /** TODO(learn): Add example Scryfall queries */
  examples?: Array<{ label: string; query: string }>;
}

/**
 * Skeleton syntax guide content — fill in descriptions and examples in Phase 6.
 *
 * @see https://scryfall.com/docs/syntax
 * @see EXERCISES.md Phase 6
 */
export const SYNTAX_SECTIONS: SyntaxSection[] = [
  { id: 'colors', title: 'Colors and Color Identity' },
  { id: 'types', title: 'Card Types' },
  { id: 'text', title: 'Oracle Text' },
  { id: 'mana', title: 'Mana Costs and CMC' },
  { id: 'rarity', title: 'Rarity and Sets' },
  { id: 'legal', title: 'Format Legality' },
  { id: 'prices', title: 'Prices' },
  { id: 'advanced', title: 'Advanced Operators' },
];
