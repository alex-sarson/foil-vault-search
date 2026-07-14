import { Component, input } from '@angular/core';

import { ScryfallCard, ScryfallImageUris } from '../../../../core/models/scryfall.types';

@Component({
  selector: 'app-card-image',
  template: `
    <div class="card-image-placeholder">
      <!-- TODO(learn): Display image from card().image_uris or card_faces[0].image_uris -->
      @if (imageUris()?.normal) {
        <img [src]="imageUris()!.normal" [alt]="alt()" loading="lazy" />
      } @else {
        <p class="placeholder">Card image — pass imageUris or card input</p>
      }
    </div>
  `,
  styles: `
    .card-image-placeholder {
      max-width: 400px;
    }

    img {
      width: 100%;
      border-radius: 4px;
    }

    .placeholder {
      color: rgba(0, 0, 0, 0.6);
      padding: 2rem;
      border: 1px dashed rgba(0, 0, 0, 0.2);
      text-align: center;
    }
  `,
})
export class CardImageComponent {
  readonly card = input<ScryfallCard | null>(null);
  readonly imageUris = input<ScryfallImageUris | null>(null);
  readonly alt = input<string>('Magic card');
}
