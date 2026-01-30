import { Component, computed, inject } from '@angular/core';
import { OrderService } from '~/app/core/order/order.service';
import { Router } from '@angular/router';
import { ConfirmationFactoryComponent } from '~/app/features/confirmation/confirmation-factory/confirmation-factory.component';
import { OrderStatus } from '~/openapi/order';
import { effectOnceIf } from 'ngxtension/effect-once-if';

@Component({
  selector: 'app-confirmation',
  imports: [ConfirmationFactoryComponent],
  templateUrl: './confirmation.component.html',
})
export class ConfirmationComponent {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private checkoutStates: string[] = [
    'checkout',
    'processing',
  ] satisfies OrderStatus[];

  paymentAdapterId = computed(() => {
    return this.orderService
      .order()
      ?.payments?.filter((payment) => payment.type === 'default')
      ?.find((payment) => payment.state !== 'removed')?.adapterId;
  });

  constructor() {
    effectOnceIf(
      () =>
        this.checkoutStates.includes(
          this.orderService.order().state?.currentStatus || '',
        ),
      async () =>
        await this.router.navigate(['/checkout'], {
          queryParamsHandling: 'preserve',
        }),
    );
  }
}
