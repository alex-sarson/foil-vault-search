import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <div class="toolbar-wrapper">
        <div>
          <span class="app-title">Foil Vault Search</span>
          <span class="spacer"></span>
        </div>
        <div>
          <a mat-button routerLink="/search" routerLinkActive="active-link"
            >Search</a
          >
          <a mat-button routerLink="/syntax" routerLinkActive="active-link"
            >Syntax Guide</a
          >
        </div>
      </div>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet />
    </main>

    <footer class="app-footer">
      Card data provided by
      <a href="https://scryfall.com" target="_blank" rel="noopener noreferrer"
        >Scryfall</a
      >. Not affiliated with Wizards of the Coast.
    </footer>
  `,
  styles: `
    .app-title {
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .main-content {
      padding: 1.5rem;
      min-height: calc(100vh - 128px);
    }

    .main-content,
    .toolbar-wrapper {
      width: var(--article-width);
      margin: var(--article-margin);
    }

    .toolbar-wrapper {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .app-footer {
      padding: 1rem 1.5rem;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    .app-footer a {
      color: inherit;
    }

    a.active-link {
      font-weight: 600;
    }
  `,
})
export class AppShellComponent {}
