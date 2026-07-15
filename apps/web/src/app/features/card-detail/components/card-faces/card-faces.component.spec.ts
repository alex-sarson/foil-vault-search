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

  it('should render a face for each card_faces entry', () => {
    fixture.componentRef.setInput('faces', [
      {
        object: 'card_face',
        name: 'Delver of Secrets',
        mana_cost: '',
        type_line: 'Create - Human Wizard',
        oracle_text: '...',
      },
      {
        object: 'card_face',
        name: 'Insectile Aberration',
        mana_cost: '',
        type_line: 'Creature - Insect Horror',
        oracle_text: '...',
      },
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Delver of Secrets');
    expect(text).toContain('Insectile Aberration');
  });
});
