import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SyntaxGuidePage } from './syntax-guide.page';
import { SYNTAX_SECTIONS } from './syntax-sections.data';

describe('SyntaxGuidePage', () => {
  let fixture: ComponentFixture<SyntaxGuidePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyntaxGuidePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SyntaxGuidePage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // TODO(test-learn): Un-skip after populating syntax sections
  xit('should render all syntax section titles', () => {
    const text = fixture.nativeElement.textContent;
    for (const section of SYNTAX_SECTIONS) {
      expect(text).toContain(section.title);
    }
  });

  xit('should navigate to search on Try it click', () => {
    fail('TODO: Click Try it button and assert navigation to /search?q=...');
  });
});
