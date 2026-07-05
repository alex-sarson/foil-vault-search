import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { ScryfallCard } from '../../../../core/models/scryfall.types';

@Component({
  selector: 'app-card-tile',
  imports: [MatCardModule],
  template: `
    <mat-card class="card-tile" appearance="outlined">
      <!-- TODO(learn): Show image_uris.small with lazy loading -->
      <mat-card-header>
        <mat-card-title>{{ card()?.name ?? 'Card name' }}</mat-card-title>
        <mat-card-subtitle>{{ card()?.set_name ?? 'Set' }}</mat-card-subtitle>
      </mat-card-header>
      <!-- TODO(learn): (click)="cardClick.emit(card()!)" and routerLink to /card/:id -->
    </mat-card>

    @if (false) {
      <!-- EXAMPLE (disabled): -->
      <!-- <img [src]="card()!.image_uris?.small" [alt]="card()!.name" loading="lazy" /> -->
    }
  `,
  styles: `
    .card-tile {
      cursor: pointer;
    }
  `,
})
export class CardTileComponent {
  readonly card = input<ScryfallCard | null>(null);
  readonly cardClick = output<ScryfallCard>();
}
