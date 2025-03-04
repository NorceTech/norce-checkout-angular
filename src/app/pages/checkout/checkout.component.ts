import {Component, computed, inject} from '@angular/core';
import {CartComponent} from '~/app/features/cart/cart.component';
import {SummaryComponent} from '~/app/features/summary/summary.component';
import {Card} from 'primeng/card';
import {OrderService} from '~/app/core/order/order.service';
import {OrderStatus} from '~/openapi/order';
import {Router} from '@angular/router';
import {PaymentFactoryComponent} from '~/app/features/payments/payment-factory/payment-factory.component';
import {ShippingFactoryComponent} from '~/app/features/shippings/shipping-factory/shipping-factory.component';
import {PaymentSelectorComponent} from '~/app/features/payments/payment-selector/payment-selector.component';
import {ShippingSelectorComponent} from '~/app/features/shippings/shipping-selector/shipping-selector.component';
import {effectOnceIf} from 'ngxtension/effect-once-if';
import {AwarditComponent} from '~/app/features/vouchers/awardit/awardit.component';
import {Button} from "primeng/button";

@Component({
  selector: 'app-checkout',
  imports: [
    CartComponent,
    SummaryComponent,
    Card,
    PaymentFactoryComponent,
    ShippingFactoryComponent,
    PaymentSelectorComponent,
    ShippingSelectorComponent,
    AwarditComponent,
    Button
  ],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private completedStates: string[] = ['accepted', 'completed', 'declined', 'removed'] satisfies OrderStatus[];

  paymentAdapterId = computed(() => {
    return this.orderService.order()
      ?.payments
      ?.filter(payment => payment.type === 'default')
      ?.find(payment => payment.state !== 'removed')
      ?.adapterId
  })

  shippingAdapterId = computed(() => {
    return this.orderService.order()
      ?.shippings
      ?.find(shipping => shipping.state !== 'removed')
      ?.adapterId
  })

  constructor() {
    effectOnceIf(
      () => this.completedStates.includes(this.orderService.order().state?.currentStatus || ''),
      async () => await this.router.navigate(['/confirmation'], {queryParamsHandling: 'preserve'})
    )
  }
}
