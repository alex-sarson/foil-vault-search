import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFacesComponent } from './card-faces.component';

describe('CardFacesComponent', () => {
  let fixture: ComponentFixture<CardFacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFacesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardFacesComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after implementing DFC face rendering
  xit('should render a face for each card_faces entry', () => {
    fail('TODO: Pass card_faces @Input and assert face names appear');
  });
});
