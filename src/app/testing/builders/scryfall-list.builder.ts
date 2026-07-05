import { ScryfallCard, ScryfallList } from '../../core/models/scryfall.types';
import { ScryfallCardBuilder } from './scryfall-card.builder';

/** Fluent factory for ScryfallList test data. */
export class ScryfallListBuilder {
  private list: ScryfallList<ScryfallCard>;

  private constructor() {
    this.list = {
      object: 'list',
      total_cards: 0,
      has_more: false,
      data: [],
    };
  }

  static create(): ScryfallListBuilder {
    return new ScryfallListBuilder();
  }

  withTotalCards(total: number): this {
    this.list.total_cards = total;
    return this;
  }

  withHasMore(hasMore: boolean): this {
    this.list.has_more = hasMore;
    return this;
  }

  withCards(cards: ScryfallCard[]): this {
    this.list.data = cards;
    this.list.total_cards = cards.length;
    return this;
  }

  withDefaultCards(count = 1): this {
    const cards = Array.from({ length: count }, (_, i) =>
      ScryfallCardBuilder.create().withId(`card-${i}`).withName(`Test Card ${i + 1}`).build(),
    );
    return this.withCards(cards);
  }

  build(): ScryfallList<ScryfallCard> {
    return structuredClone(this.list);
  }
}
