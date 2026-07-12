import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SearchPage } from './search.page';
import { ScryfallApiService } from '../../core/services/scryfall-api.service';
import { ScryfallListBuilder } from '../../testing/builders/scryfall-list.builder';

describe('SearchPage', () => {
  let fixture: ComponentFixture<SearchPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [
        provideRouter([]),
        // Page injects ScryfallApiService (temp Phase 2 wiring) — mock it so
        // the smoke test does not need real HttpClient (same pattern as T1b).
        {
          provide: ScryfallApiService,
          useValue: {
            searchCards: jasmine
              .createSpy('searchCards')
              .and.returnValue(of(ScryfallListBuilder.create().build())),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing search UI
  xit('should render placeholder checklist', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Implement search here');
  });

  xit('should call service on search', () => {
    fail('TODO: Mock ScryfallApiService and assert searchCards is called');
  });
});
