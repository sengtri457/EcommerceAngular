import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Customcusor } from './customcusor';

describe('Customcusor', () => {
  let component: Customcusor;
  let fixture: ComponentFixture<Customcusor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customcusor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customcusor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
