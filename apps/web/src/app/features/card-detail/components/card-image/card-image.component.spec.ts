import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardImageComponent } from './card-image.component';
import { ScryfallCardBuilder } from '../../../../testing/builders/scryfall-card.builder';

describe('CardImageComponent', () => {
  let fixture: ComponentFixture<CardImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardImageComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render img when imageUris provided', () => {
    fixture.componentRef.setInput('imageUris', {
      small: 'https://example.com/s.jpg',
      normal: 'https://example.com/card.jpg',
      large: 'https://example.com/l.jpg',
    });
    fixture.componentRef.setInput('alt', 'Test Card');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')?.src).toContain(
      'example.com/card.jpg',
    );
  });
});
