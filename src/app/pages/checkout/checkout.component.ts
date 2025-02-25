import {Component, computed, inject} from '@angular/core';
import {CartComponent} from '~/app/features/cart/cart.component';
import {SummaryComponent} from '~/app/features/summary/summary.component';
import {Card} from 'primeng/card';
import {OrderService} from '~/app/core/order/order.service';
import {filter, map} from 'rxjs';
import {OrderStatus} from '~/openapi/order';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {PaymentFactoryComponent} from '~/app/features/payments/payment-factory/payment-factory.component';
import {ShippingFactoryComponent} from '~/app/features/shippings/shipping-factory/shipping-factory.component';
import {PaymentSelectorComponent} from '~/app/features/payments/payment-selector/payment-selector.component';
import {ShippingSelectorComponent} from '~/app/features/shippings/shipping-selector/shipping-selector.component';

@Component({
  selector: 'app-checkout',
  imports: [
    CartComponent,
    SummaryComponent,
    Card,
    PaymentFactoryComponent,
    ShippingFactoryComponent,
    PaymentSelectorComponent,
    ShippingSelectorComponent
  ],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private completedStates: OrderStatus[] = ['accepted', 'completed', 'declined', 'removed']

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
    this.orderService.order$.pipe(
      map(order => order.state?.currentStatus),
      filter(state => !!state && this.completedStates.includes(state)),
      takeUntilDestroyed()
    ).subscribe(async () => {
      await this.router.navigate(['/confirmation'], {queryParamsHandling: 'preserve'});
    })
  }
}
