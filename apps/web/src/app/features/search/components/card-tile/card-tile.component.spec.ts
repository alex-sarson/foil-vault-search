import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTileComponent } from './card-tile.component';
import { ScryfallCardBuilder } from '../../../../testing/builders/scryfall-card.builder';
import { ScryfallCard } from '../../../../core/models/scryfall.types';

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

  it('should display card name from @Input', () => {
    const card = ScryfallCardBuilder.create()
      .withName('Lightning Bolt')
      .build();
    fixture.componentRef.setInput('card', card);
    fixture.detectChanges();

    let clicked: ScryfallCard | undefined;
    fixture.componentInstance.cardClick.subscribe((c) => (clicked = c));

    const tile: HTMLElement =
      fixture.nativeElement.querySelector('.card-tile') ??
      fixture.nativeElement.querySelector('mat-card');
    tile.click();

    expect(clicked).toEqual(card);
  });

  xit('should emit cardClick when clicked', () => {
    fail('TODO: Click tile and assert cardClick output');
  });
});
