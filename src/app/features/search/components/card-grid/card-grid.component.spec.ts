import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGridComponent } from './card-grid.component';
import { ScryfallCardBuilder } from '../../../../testing/builders/scryfall-card.builder';

describe('CardGridComponent', () => {
  let fixture: ComponentFixture<CardGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGridComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing CardGridComponent
  xit('should render N tiles from cards @Input', () => {
    const cards = [
      ScryfallCardBuilder.create().withName('Bolt').build(),
      ScryfallCardBuilder.create().withName('Shock').build(),
    ];
    fixture.componentRef.setInput('cards', cards);
    fixture.detectChanges();
    fail('TODO: Assert two app-card-tile elements');
  });
});
