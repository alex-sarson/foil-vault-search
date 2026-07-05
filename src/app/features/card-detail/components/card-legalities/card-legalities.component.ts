import { Component, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { LegalityStatus } from '../../../../core/models/scryfall.types';

@Component({
  selector: 'app-card-legalities',
  imports: [MatTableModule],
  template: `
    <div class="legalities">
      <h3>Legalities</h3>
      @if (legalitiesEntries().length === 0) {
        <p class="placeholder">Format legalities table — pass legalities input</p>
      } @else {
        <table mat-table [dataSource]="legalitiesEntries()" class="legalities-table">
          <ng-container matColumnDef="format">
            <th mat-header-cell *matHeaderCellDef>Format</th>
            <td mat-cell *matCellDef="let row">{{ row.format }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row">{{ row.status }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      }
    </div>
  `,
  styles: `
    .legalities-table {
      width: 100%;
      max-width: 400px;
    }

    .placeholder {
      color: rgba(0, 0, 0, 0.6);
    }
  `,
})
export class CardLegalitiesComponent {
  readonly legalities = input<Record<string, LegalityStatus>>({});

  readonly displayedColumns = ['format', 'status'] as const;

  legalitiesEntries(): Array<{ format: string; status: LegalityStatus }> {
    return Object.entries(this.legalities()).map(([format, status]) => ({ format, status }));
  }
}
