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

  it('should emit searchQuery when user types', () => {
    const emissions: string[] = [];
    fixture.componentInstance.searchQuery.subscribe((q) => emissions.push(q));

    const inputEl: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl.disabled).toBeFalse();

    inputEl.value = 'bolt';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emissions).toContain('bolt');
  });

  xit('should debounce emissions (~300ms)', () => {
    // HINT: use fakeAsync + tick
    fail('TODO: Implement debounce test');
  });
});
