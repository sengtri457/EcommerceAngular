import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShirtComponent } from './shirt-component';

describe('ShirtComponent', () => {
  let component: ShirtComponent;
  let fixture: ComponentFixture<ShirtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShirtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShirtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
