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

  it('should render N tiles from cards @Input', () => {
    const cards = [
      ScryfallCardBuilder.create().withId('bolt-id').withName('Bolt').build(),
      ScryfallCardBuilder.create().withId('shock-id').withName('Shock').build(),
    ];
    fixture.componentRef.setInput('cards', cards);
    fixture.detectChanges();

    const tiles = fixture.nativeElement.querySelectorAll('app-card-tile');
    expect(tiles.length).toBe(2);
  });
});
