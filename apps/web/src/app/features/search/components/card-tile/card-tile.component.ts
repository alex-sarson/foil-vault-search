import { Component, effect, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { ScryfallCard } from '../../../../core/models/scryfall.types';

@Component({
  selector: 'app-card-tile',
  imports: [MatCardModule],
  template: `
    <mat-card
      class="card-tile"
      appearance="outlined"
      (click)="card() && cardClick.emit(card()!)"
    >
      <img
        [src]="
          card()?.image_uris?.small ??
          card()?.card_faces?.[0]?.image_uris?.small ??
          null
        "
        [alt]="card()?.name ?? ''"
        loading="lazy"
      />
    </mat-card>

    @if (false) {}
  `,
  styles: `
    .card-tile {
      cursor: pointer;
      overflow: hidden;
    }
  `,
})
export class CardTileComponent {
  readonly card = input<ScryfallCard | null>(null);
  readonly cardClick = output<ScryfallCard>();

  constructor() {
    effect(() => {
      if (this.card()?.name.includes('Altar')) {
        console.log(this.card());
      }
    });
  }
}
