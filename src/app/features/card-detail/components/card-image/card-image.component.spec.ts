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

  // TODO(test-learn): Un-skip after wiring image display
  xit('should render img when imageUris provided', () => {
    fixture.componentRef.setInput('imageUris', {
      normal: 'https://example.com/card.jpg',
    });
    fixture.componentRef.setInput('alt', 'Test Card');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img?.src).toContain('example.com/card.jpg');
  });
});
