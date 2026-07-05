import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { CardImageComponent } from './components/card-image/card-image.component';
import { CardFacesComponent } from './components/card-faces/card-faces.component';
import { CardLegalitiesComponent } from './components/card-legalities/card-legalities.component';

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
        <p>
          Load card from router state, cache, or API (in that order). Replace this placeholder
          with a full detail layout.
        </p>

        <mat-list>
          <div mat-subheader>Your TODO checklist</div>
          <mat-list-item>Implement getCardById() in ScryfallApiService (Phase 1)</mat-list-item>
          <mat-list-item>Load card from navigation state or API fallback</mat-list-item>
          <mat-list-item>Render single- and double-faced layouts</mat-list-item>
          <mat-list-item>Wire CardImageComponent, CardFacesComponent, CardLegalitiesComponent</mat-list-item>
          <mat-list-item>Back navigation preserving search context</mat-list-item>
        </mat-list>

        <app-card-image />
        <app-card-faces />
        <app-card-legalities />

        @if (false) {
          <!-- EXAMPLE (disabled): route param + service -->
          <!-- inject(ScryfallApiService).getCardById(cardId).subscribe(console.log) -->
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
export class CardDetailPage {
  private readonly route = inject(ActivatedRoute);

  /** Proves ActivatedRoute param reading works — replace with real loading logic. */
  readonly cardId = this.route.snapshot.paramMap.get('id') ?? '(none)';
}
