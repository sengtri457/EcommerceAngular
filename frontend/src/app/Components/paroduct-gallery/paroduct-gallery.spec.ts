import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParoductGallery } from './paroduct-gallery';

describe('ParoductGallery', () => {
  let component: ParoductGallery;
  let fixture: ComponentFixture<ParoductGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParoductGallery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParoductGallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
