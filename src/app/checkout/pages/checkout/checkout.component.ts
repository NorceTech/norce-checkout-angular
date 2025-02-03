import {Component, inject} from '@angular/core';
import {CartComponent} from '~/app/checkout/support/cart/cart.component';
import {SummaryComponent} from '~/app/checkout/support/summary/summary.component';
import {Card} from 'primeng/card';
import {OrderService} from '~/app/core/order/order.service';
import {distinctUntilChanged, filter, map} from 'rxjs';
import {OrderStatus} from '~/openapi/order';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {PaymentFactoryComponent} from '~/app/checkout/support/payment-factory/payment-factory.component';

@Component({
  selector: 'app-checkout',
  imports: [
    CartComponent,
    SummaryComponent,
    Card,
    AsyncPipe,
    PaymentFactoryComponent
  ],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private completedStates: OrderStatus[] = ['accepted', 'completed', 'declined', 'removed']

  defaultPaymentAdapterId$ = this.orderService.defaultPayment$.pipe(
    map(payment => payment.adapterId),
    filter(adapterId => typeof adapterId !== 'undefined'),
    distinctUntilChanged(),
  )

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
