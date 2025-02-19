import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingSelectorComponent } from './shipping-selector.component';

describe('ShippingSelectorComponent', () => {
  let component: ShippingSelectorComponent;
  let fixture: ComponentFixture<ShippingSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
