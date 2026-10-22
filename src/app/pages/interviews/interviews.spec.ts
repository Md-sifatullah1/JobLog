import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Interviews } from './interviews';

describe('Interviews', () => {
  let component: Interviews;
  let fixture: ComponentFixture<Interviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Interviews],
    }).compileComponents();

    fixture = TestBed.createComponent(Interviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
