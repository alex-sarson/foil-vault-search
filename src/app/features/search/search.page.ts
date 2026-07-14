import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CardGridComponent } from './components/card-grid/card-grid.component';
import { ScryfallApiService } from '../../core/services/scryfall-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ScryfallCard } from '../../core/models/scryfall.types';

@Component({
  selector: 'app-search-page',
  imports: [
    MatCardModule,
    MatListModule,
    SearchBarComponent,
    CardGridComponent,
  ],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Search</mat-card-title>
        <mat-card-subtitle
          >Find Magic cards using Scryfall syntax</mat-card-subtitle
        >
      </mat-card-header>

      <mat-card-content>
        <p>
          Implement search here. Wire <code>SearchBarComponent</code> output to
          <code>ScryfallApiService.searchCards()</code>. Display results in
          <code>CardGridComponent</code>.
        </p>

        <app-search-bar (searchQuery)="onSearch($event)" />
        <app-card-grid
          [cards]="cards()"
          (cardSelected)="onCardSelected($event)"
        />

        @if (false) {}
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    code {
      font-size: 0.9em;
    }
  `,
})
export class SearchPage {
  // Temp function to test searchCards() in the browser console
  private readonly api = inject(ScryfallApiService);
  readonly cards = signal<ScryfallCard[]>([]);

  onSearch(query: string): void {
    if (!query) {
      this.cards.set([]);
      return;
    }
    this.api.searchCards(query).subscribe({
      next: (list) => this.cards.set(list.data),
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.cards.set([]);
        } else {
          console.error(err);
        }
      },
    });
  }

  onCardSelected(card: ScryfallCard): void {
    console.log('selected', card.id);
  }
}
