import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { ScryfallCardFace } from '../../../../core/models/scryfall.types';

@Component({
  selector: 'app-card-faces',
  imports: [MatCardModule],
  template: `
    <div class="card-faces">
      @if (faces().length === 0) {
        <p class="placeholder">Double-faced card faces — pass card_faces input</p>
      }
      <!-- TODO(learn): @for (face of faces(); track face.name) { ... } -->
    </div>

    @if (false) {
      <!-- EXAMPLE (disabled): -->
      <!-- @for (face of faces(); track face.name) {
        <mat-card>
          <mat-card-title>{{ face.name }}</mat-card-title>
          <mat-card-content>{{ face.oracle_text }}</mat-card-content>
        </mat-card>
      } -->
    }
  `,
  styles: `
    .card-faces {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .placeholder {
      color: rgba(0, 0, 0, 0.6);
    }
  `,
})
export class CardFacesComponent {
  readonly faces = input<ScryfallCardFace[]>([]);
}
