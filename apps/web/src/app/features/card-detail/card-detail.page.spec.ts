import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';

import { CardDetailPage } from './card-detail.page';
import { ScryfallApiService } from '../../core/services/scryfall-api.service';
import { of } from 'rxjs';
import { cardDetailSample } from '../../testing/fixtures';
import { CardCacheService } from '../../core/services/card-cache.service';

describe('CardDetailPage', () => {
  let fixture: ComponentFixture<CardDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'test-card-id' } },
          },
        },
        {
          provide: ScryfallApiService,
          useValue: {
            getCardById: jasmine
              .createSpy('getCardById')
              .and.returnValue(of(cardDetailSample)),
          },
        },
        {
          provide: CardCacheService,
          useValue: {
            get: () => undefined,
            set: () => undefined,
            evict: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetailPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should read route param id', () => {
    expect(fixture.componentInstance.cardId).toBe('test-card-id');
  });

  it('should load card from service', () => {
    const api = TestBed.inject(ScryfallApiService);
    expect(api.getCardById).toHaveBeenCalledWith('test-card-id');

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      (cardDetailSample as { name: string }).name,
    );
  });
});
