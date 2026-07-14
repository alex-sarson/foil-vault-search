import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing SearchBarComponent
  xit('should emit searchQuery when user types', () => {
    fail('TODO: Simulate input and assert searchQuery output');
  });

  xit('should debounce emissions (~300ms)', () => {
    // HINT: use fakeAsync + tick
    fail('TODO: Implement debounce test');
  });
});
