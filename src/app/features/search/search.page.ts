import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CardGridComponent } from './components/card-grid/card-grid.component';

@Component({
  selector: 'app-search-page',
  imports: [MatCardModule, MatListModule, SearchBarComponent, CardGridComponent],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Search</mat-card-title>
        <mat-card-subtitle>Find Magic cards using Scryfall syntax</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <p>
          Implement search here. Wire <code>SearchBarComponent</code> output to
          <code>ScryfallApiService.searchCards()</code>. Display results in
          <code>CardGridComponent</code>.
        </p>

        <mat-list>
          <div mat-subheader>Your TODO checklist</div>
          <mat-list-item>Wire SearchBarComponent with debounced query</mat-list-item>
          <mat-list-item>Call ScryfallApiService.searchCards()</mat-list-item>
          <mat-list-item>Sync q and page to URL query params</mat-list-item>
          <mat-list-item>Add mat-paginator (175 cards/page)</mat-list-item>
          <mat-list-item>Handle loading, empty, and error states</mat-list-item>
          <mat-list-item>Navigate to /card/:id on tile click</mat-list-item>
        </mat-list>

        <app-search-bar />
        <app-card-grid />

        @if (false) {
          <!-- EXAMPLE (disabled): signals + service call -->
          <!-- readonly query = signal(''); -->
          <!-- readonly results = signal<ScryfallCard[]>([]); -->
          <!-- inject(ScryfallApiService).searchCards(query()).subscribe(...) -->
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

    code {
      font-size: 0.9em;
    }
  `,
})
export class SearchPage {}
