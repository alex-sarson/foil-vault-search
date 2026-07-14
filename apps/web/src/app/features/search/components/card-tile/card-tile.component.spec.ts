import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTileComponent } from './card-tile.component';
import { ScryfallCardBuilder } from '../../../../testing/builders/scryfall-card.builder';

describe('CardTileComponent', () => {
  let fixture: ComponentFixture<CardTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardTileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardTileComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing CardTileComponent
  xit('should display card name from @Input', () => {
    const card = ScryfallCardBuilder.create().withName('Lightning Bolt').build();
    fixture.componentRef.setInput('card', card);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Lightning Bolt');
  });

  xit('should emit cardClick when clicked', () => {
    fail('TODO: Click tile and assert cardClick output');
  });
});
