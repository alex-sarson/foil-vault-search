import { Component, input, output } from '@angular/core';

import { ScryfallCard } from '../../../../core/models/scryfall.types';
import { CardTileComponent } from '../card-tile/card-tile.component';

@Component({
  selector: 'app-card-grid',
  imports: [CardTileComponent],
  template: `
    <div class="card-grid">
      @if (cards().length === 0) {
        <p class="placeholder">No cards to display — wire results from SearchPage.</p>
      }
      <!-- TODO(learn): @for (card of cards(); track card.id) { <app-card-tile ... /> } -->
    </div>

    @if (false) {
      <!-- EXAMPLE (disabled): -->
      <!-- @for (card of cards(); track card.id) {
        <app-card-tile [card]="card" (cardClick)="cardSelected.emit(card)" />
      } -->
    }
  `,
  styles: `
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }

    .placeholder {
      grid-column: 1 / -1;
      color: rgba(0, 0, 0, 0.6);
    }
  `,
})
export class CardGridComponent {
  readonly cards = input<ScryfallCard[]>([]);
  readonly cardSelected = output<ScryfallCard>();
}
