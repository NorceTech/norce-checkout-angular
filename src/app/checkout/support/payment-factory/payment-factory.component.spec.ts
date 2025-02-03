import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentFactoryComponent } from './payment-factory.component';

describe('PaymentFactoryComponent', () => {
  let component: PaymentFactoryComponent;
  let fixture: ComponentFixture<PaymentFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFactoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
