import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { SearchPage } from './search.page';
import { ScryfallApiService } from '../../core/services/scryfall-api.service';
import { ScryfallListBuilder } from '../../testing/builders/scryfall-list.builder';
import {
  navigateWithQueryParams,
  setupRouterTesting,
} from '../../testing/helpers/router-test.helpers';

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

  xit('should call service on search', () => {
    const api = TestBed.inject(ScryfallApiService);
    const searchSpy = api.searchCards as jasmine.Spy;

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = 'lightning';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(searchSpy).toHaveBeenCalled();
    expect(searchSpy.calls.mostRecent().args[0]).toBe('lightning');
  });

  xit('should read q from the URL and search', async () => {
    const harness = await setupRouterTesting(
      [{ path: 'search', component: SearchPage }],
      '/search',
    );

    // Ensure ScryfallApiService is still mocked in the TestBed used by setupRouterTesting —
    // if the helper creates its own TestBed, provide the mock there the same way as beforeEach.

    await navigateWithQueryParams(harness, '/search', { q: 'bolt' });

    const api = TestBed.inject(ScryfallApiService);
    expect(api.searchCards as jasmine.Spy).toHaveBeenCalled();
  });

  it('should navigate with q when searching', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture.componentInstance.onSearch('bolt');

    expect(router.navigate).toHaveBeenCalled();
  });
});
