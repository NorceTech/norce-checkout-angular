import {Component, inject} from '@angular/core';
import {PaymentFactoryComponent} from '~/app/checkout/payments/payment-factory/payment-factory.component';
import {OrderService} from '~/app/core/order/order.service';
import {distinctUntilChanged, filter, map} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';

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
  private router = inject(Router);
  private checkoutStates = ['checkout', 'processing']
  defaultPaymentAdapterId$ = this.orderService.defaultPayment$.pipe(
    map(payment => payment.adapterId),
    filter(adapterId => typeof adapterId !== 'undefined'),
    distinctUntilChanged(),
  )

  constructor() {
    this.orderService.order$.pipe(
      map(order => order.state?.currentStatus),
      filter(state => !!state && this.checkoutStates.includes(state)),
      takeUntilDestroyed()
    ).subscribe(async () => {
      await this.router.navigate(['/checkout'], {queryParamsHandling: 'preserve'});
    })
  }
}
