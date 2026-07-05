import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { SYNTAX_SECTIONS } from './syntax-sections.data';

@Component({
  selector: 'app-syntax-guide-page',
  imports: [MatCardModule, MatListModule, MatButtonModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Syntax Guide</mat-card-title>
        <mat-card-subtitle>Learn Scryfall search syntax</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <p>
          Fill in <code>syntax-sections.data.ts</code> with descriptions and example queries.
          Wire "Try it" buttons to navigate to <code>/search?q=...</code>.
        </p>

        <p>
          Official docs:
          <a href="https://scryfall.com/docs/syntax" target="_blank" rel="noopener noreferrer">
            Scryfall search reference
          </a>
        </p>

        <mat-list>
          @for (section of sections; track section.id) {
            <mat-list-item>
              <span matListItemTitle>{{ section.title }}</span>
              @if (section.description) {
                <span matListItemLine>{{ section.description }}</span>
              } @else {
                <span matListItemLine class="todo">TODO: Add description and examples</span>
              }
              <!-- TODO(learn): Try it button → [routerLink]="['/search']" [queryParams]="{ q: example.query }" -->
            </mat-list-item>
          }
        </mat-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .todo {
      font-style: italic;
      color: rgba(0, 0, 0, 0.6);
    }

    code {
      font-size: 0.9em;
    }
  `,
})
export class SyntaxGuidePage {
  readonly sections = SYNTAX_SECTIONS;
}
