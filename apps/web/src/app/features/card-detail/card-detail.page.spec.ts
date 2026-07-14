import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';

import { CardDetailPage } from './card-detail.page';
import { ScryfallApiService } from '../../core/services/scryfall-api.service';
import { of } from 'rxjs';

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
              .and.returnValue(of({})),
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

  // TODO(test-learn): Un-skip after implementing card detail loading
  xit('should read route param id', () => {
    expect(fixture.componentInstance.cardId).toBe('test-card-id');
  });

  xit('should load card from service', () => {
    fail('TODO: Mock ScryfallApiService.getCardById and assert card renders');
  });
});
