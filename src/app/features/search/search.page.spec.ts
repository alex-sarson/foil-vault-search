import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SearchPage } from './search.page';

describe('SearchPage', () => {
  let fixture: ComponentFixture<SearchPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [provideRouter([])],
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
