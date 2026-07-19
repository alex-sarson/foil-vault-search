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
  {
    id: 'colors',
    title: 'Colors and Color Identity',
    description: 'Filter by card colors or color identity.',
    examples: [
      { label: 'Cards that contain red in their identity', query: 'c:red' },
      { label: 'Cards with the Sultai identity', query: 'id:ubg' },
    ],
  },
  {
    id: 'types',
    title: 'Card Types',
    description: 'Filter cards by type.',
    examples: [
      { label: 'Cards that are the type Artifact', query: 't:artifact' },
      {
        label: 'Cards that are both the types Artifact and Creature',
        query: 't:artifact t:creature',
      },
    ],
  },
  {
    id: 'text',
    title: 'Oracle Text',
    description: 'Filter cards by a string that card contains.',
    examples: [
      {
        label: 'Cards that contain the text "Draw a card"',
        query: 'o:"Draw a card"',
      },
    ],
  },
  {
    id: 'mana',
    title: 'Mana Costs and CMC',
    description: 'Filter cards by their converted mana cost.',
    examples: [
      { label: 'Cards that are less than CMC 3', query: 'cmc<3' },
      { label: 'Cards that are equal to CMC 3', query: 'cmc:3' },
      { label: 'Cards that are greater than CMC 3', query: 'cmc>3' },
    ],
  },
  {
    id: 'rarity',
    title: 'Rarity and Sets',
    description: 'Filter cards by their Rarity.',
    examples: [
      { label: 'Cards that are of common Rarity', query: 'r:common' },
      { label: 'Cards that are greater than common Rarity', query: 'r>common' },
    ],
  },
  {
    id: 'legal',
    title: 'Format Legality',
    description: 'Filter cards by their Format Legality',
    examples: [
      { label: 'Cards that are legal in Commander', query: 'f:commander' },
      { label: 'Cards that are legal in Standard', query: 'f:standard' },
    ],
  },
  {
    id: 'prices',
    title: 'Prices',
    description: 'Filter cards by their price in EUR, USD & TIX.',
    examples: [
      { label: 'Cards that are equal less than 2 US Dollars', query: 'usd<2' },
      { label: 'Cards that are equal more than 3 Euros', query: 'eur>3' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Operators',
    description: 'Filter cards using advanced operators',
    examples: [
      { label: 'Cards that are Fish or Birds', query: 't:fish or t:bird' },
      {
        label: 'Cards that are legendary goblins or elves',
        query: 't:legendary (t:goblin or t:elf)',
      },
    ],
  },
];
