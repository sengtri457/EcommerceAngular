import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusebeProducts } from './reusebe-products';

describe('ReusebeProducts', () => {
  let component: ReusebeProducts;
  let fixture: ComponentFixture<ReusebeProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReusebeProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusebeProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
