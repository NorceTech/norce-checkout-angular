import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ShippingFactoryComponent} from './shipping-factory.component';

describe('ShippingFactoryComponent', () => {
  let component: ShippingFactoryComponent;
  let fixture: ComponentFixture<ShippingFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingFactoryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ShippingFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
