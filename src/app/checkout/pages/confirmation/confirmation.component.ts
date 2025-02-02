import {Component, inject} from '@angular/core';
import {PaymentFactoryComponent} from '~/app/checkout/payments/payment-factory/payment-factory.component';
import {OrderService} from '~/app/core/order/order.service';
import {distinctUntilChanged, filter, map} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-confirmation',
  imports: [
    PaymentFactoryComponent,
    AsyncPipe
  ],
  templateUrl: './confirmation.component.html',
})
export class ConfirmationComponent {
  private orderService = inject(OrderService);

  defaultPaymentAdapterId$ = this.orderService.defaultPayment$.pipe(
    map(payment => payment.adapterId),
    filter(adapterId => typeof adapterId !== 'undefined'),
    distinctUntilChanged(),
  )
}
