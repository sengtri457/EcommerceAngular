import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdate } from './admin-update';

describe('AdminUpdate', () => {
  let component: AdminUpdate;
  let fixture: ComponentFixture<AdminUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
