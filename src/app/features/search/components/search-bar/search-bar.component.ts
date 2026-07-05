import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-bar',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>Search cards</mat-label>
      <mat-icon matPrefix>search</mat-icon>
      <input matInput placeholder="e.g. c:red t:creature" disabled />
      <!-- TODO(learn): Wire input with debounce (~300ms) and emit searchQuery -->
    </mat-form-field>

    @if (false) {
      <!-- EXAMPLE (disabled): output binding pattern -->
      <!-- (input)="onQueryChange($event)" -->
    }
  `,
  styles: `
    .search-field {
      width: 100%;
      max-width: 40rem;
    }
  `,
})
export class SearchBarComponent {
  /** Initial query from URL — bind in SearchPage. */
  readonly initialQuery = input<string>('');

  /** Emits when the user submits or debounced query changes. */
  readonly searchQuery = output<string>();
}
