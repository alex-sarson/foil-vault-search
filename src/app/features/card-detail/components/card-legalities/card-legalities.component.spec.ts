import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardLegalitiesComponent } from './card-legalities.component';

describe('CardLegalitiesComponent', () => {
  let fixture: ComponentFixture<CardLegalitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardLegalitiesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardLegalitiesComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after wiring legalities table
  xit('should render format rows from legalities @Input', () => {
    fixture.componentRef.setInput('legalities', {
      modern: 'legal',
      standard: 'not_legal',
    });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('modern');
    expect(text).toContain('legal');
  });
});
