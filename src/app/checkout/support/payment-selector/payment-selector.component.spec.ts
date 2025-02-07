import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSelectorComponent } from './payment-selector.component';

describe('PaymentSelectorComponent', () => {
  let component: PaymentSelectorComponent;
  let fixture: ComponentFixture<PaymentSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
