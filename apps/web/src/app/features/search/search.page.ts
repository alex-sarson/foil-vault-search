import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CardGridComponent } from './components/card-grid/card-grid.component';
import { ScryfallApiService } from '../../core/services/scryfall-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ScryfallCard } from '../../core/models/scryfall.types';
import { ActivatedRoute, Router } from '@angular/router';

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

        <app-search-bar
          [initialQuery]="initialQuery()"
          (searchQuery)="onSearch($event)"
        />
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
export class SearchPage implements OnInit {
  // Temp function to test searchCards() in the browser console
  private readonly api = inject(ScryfallApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly cards = signal<ScryfallCard[]>([]);

  readonly initialQuery = signal('');

  onSearch(query: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  private runSearch(query: string, page: number): void {
    this.api.searchCards(query, page).subscribe({
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
    void this.router.navigate(['/card', card.id], { state: { card } });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      const page = Number(params.get('page') ?? '1') || 1;
      this.initialQuery.set(q);
      if (q) {
        this.runSearch(q, page);
      } else {
        this.cards.set([]);
      }
    });
  }
}
