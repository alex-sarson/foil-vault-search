import {
  Component,
  inject,
  OnInit,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { CardImageComponent } from './components/card-image/card-image.component';
import { CardFacesComponent } from './components/card-faces/card-faces.component';
import { CardLegalitiesComponent } from './components/card-legalities/card-legalities.component';

import { ScryfallApiService } from '../../core/services/scryfall-api.service';
import { ScryfallCard } from '../../core/models/scryfall.types';
import { CardCacheService } from '../../core/services/card-cache.service';

@Component({
  selector: 'app-card-detail-page',
  imports: [
    MatCardModule,
    MatListModule,
    CardImageComponent,
    CardFacesComponent,
    CardLegalitiesComponent,
  ],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Card Detail</mat-card-title>
        <mat-card-subtitle>Route param id: {{ cardId }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        @if (card(); as c) {
          <h2>{{ c.name }}</h2>
          <a [href]="c.scryfall_uri" target="_blank" rel="noopener"
            >View on Scryfall</a
          >

          <app-card-image
            [card]="c"
            [imageUris]="c.image_uris ?? c.card_faces?.[0]?.image_uris ?? null"
            [alt]="c.name"
          />

          @if (c.card_faces?.length) {
            <app-card-faces [faces]="c.card_faces!" />
          }

          <app-card-legalities [legalities]="c.legalities" />
        } @else {
          <p>Loading...</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  `,
})
export class CardDetailPage implements OnInit {
  readonly card = signal<ScryfallCard | null>(null);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ScryfallApiService);
  private readonly cache = inject(CardCacheService);
  readonly cardId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    if (!this.cardId) return;

    const fromNav = history.state?.['card'] as ScryfallCard | undefined;
    if (fromNav?.id === this.cardId) {
      this.card.set(fromNav);
      this.cache.set(this.cardId, fromNav);
      return;
    }

    const cached = this.cache.get(this.cardId);
    if (cached) {
      this.card.set(cached);
      return;
    }

    this.api.getCardById(this.cardId).subscribe({
      next: (card) => {
        this.card.set(card);
        this.cache.set(this.cardId, card);
      },
      error: (err) => console.error('Failed to load card:', err),
    });
  }
}
