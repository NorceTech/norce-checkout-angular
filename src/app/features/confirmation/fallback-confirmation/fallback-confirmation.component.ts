import {Component, computed, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {Card} from 'primeng/card';
import {Tag} from 'primeng/tag';
import {PricePipe} from '~/app/shared/pipes/price.pipe';
import {DatePipe, TitleCasePipe} from '@angular/common';
import {OrderStatus, PaymentState} from '~/openapi/order';

@Component({
  selector: 'app-default-confirmation',
  imports: [
    Card,
    Tag,
    PricePipe,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './fallback-confirmation.component.html',
})
export class FallbackConfirmationComponent {
  private orderService = inject(OrderService);

  order = this.orderService.order;
  payment = computed(() => {
    return this.order()
      ?.payments
      ?.filter(payment => payment.type === 'default')
      ?.find(payment => payment.state !== 'removed')
  });

  getStatusSeverity(status?: OrderStatus) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warn';
      case 'accepted':
        return 'info';
      default:
        return 'danger';
    }
  }

  getPaymentSeverity(status?: PaymentState) {
    switch (status?.toLowerCase()) {
      case 'captured':
        return 'success';
      case 'reserved':
        return 'warn';
      default:
        return 'danger';
    }
  }
}
