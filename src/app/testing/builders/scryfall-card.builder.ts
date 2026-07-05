import { ScryfallCard, ScryfallCardFace, ScryfallImageUris } from '../../core/models/scryfall.types';

/** Fluent factory for ScryfallCard test data. */
export class ScryfallCardBuilder {
  private card: ScryfallCard;

  private constructor() {
    this.card = {
      object: 'card',
      id: 'test-card-id',
      oracle_id: 'test-oracle-id',
      name: 'Test Card',
      lang: 'en',
      released_at: '2020-01-01',
      uri: 'https://api.scryfall.com/cards/test-card-id',
      scryfall_uri: 'https://scryfall.com/card/test/set/1/test-card',
      layout: 'normal',
      highres_image: true,
      image_status: 'highres_scan',
      cmc: 1,
      type_line: 'Instant',
      color_identity: [],
      keywords: [],
      legalities: { standard: 'not_legal', modern: 'legal' },
      games: ['paper'],
      reserved: false,
      foil: true,
      nonfoil: true,
      finishes: ['nonfoil', 'foil'],
      oversized: false,
      promo: false,
      reprint: false,
      variation: false,
      set_id: 'test-set-id',
      set: 'tst',
      set_name: 'Test Set',
      set_type: 'core',
      set_uri: 'https://api.scryfall.com/sets/tst',
      set_search_uri: 'https://api.scryfall.com/cards/search?q=e:tst',
      scryfall_set_uri: 'https://scryfall.com/sets/tst',
      rulings_uri: 'https://api.scryfall.com/cards/test-card-id/rulings',
      prints_search_uri: 'https://api.scryfall.com/cards/search?q=oracleid:test',
      collector_number: '1',
      digital: false,
      rarity: 'common',
      artist: 'Test Artist',
      artist_ids: ['artist-id'],
      border_color: 'black',
      frame: '2015',
      full_art: false,
      textless: false,
      booster: true,
      story_spotlight: false,
    };
  }

  static create(): ScryfallCardBuilder {
    return new ScryfallCardBuilder();
  }

  withId(id: string): this {
    this.card.id = id;
    this.card.uri = `https://api.scryfall.com/cards/${id}`;
    return this;
  }

  withName(name: string): this {
    this.card.name = name;
    return this;
  }

  withImageUris(imageUris: ScryfallImageUris): this {
    this.card.image_uris = imageUris;
    return this;
  }

  withCardFaces(faces: ScryfallCardFace[]): this {
    this.card.card_faces = faces;
    this.card.layout = 'transform';
    return this;
  }

  withLayout(layout: ScryfallCard['layout']): this {
    this.card.layout = layout;
    return this;
  }

  build(): ScryfallCard {
    return structuredClone(this.card);
  }
}
