import {Component, computed, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {filter, map} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {
  ConfirmationFactoryComponent
} from '~/app/features/confirmation/confirmation-factory/confirmation-factory.component';

@Component({
  selector: 'app-confirmation',
  imports: [
    ConfirmationFactoryComponent
  ],
  templateUrl: './confirmation.component.html',
})
export class ConfirmationComponent {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private checkoutStates = ['checkout', 'processing']

  paymentAdapterId = computed(() => {
    return this.orderService.order()
      ?.payments
      ?.filter(payment => payment.type === 'default')
      ?.find(payment => payment.state !== 'removed')
      ?.adapterId
  })

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
