import {Component, computed, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {PricePipe} from '~/app/shared/pipes/price.pipe';
import {Tooltip} from 'primeng/tooltip';

@Component({
  selector: 'app-cart-summary',
  imports: [
    PricePipe,
    Tooltip
  ],
  templateUrl: './cart-summary.component.html',
})
export class CartSummaryComponent {
  private orderService = inject(OrderService);

  order = this.orderService.order;

  paidForWithVouchers = computed(() => this.order()
    .payments
    ?.filter(payment => payment.state !== 'removed')
    ?.filter(payment => payment.type === 'voucher')
    ?.reduce((acc, payment) => acc + (payment.amount || 0), 0) || 0
  );

  paidForWithPayment = computed(() => this.order()
    .payments
    ?.filter(payment => payment.state !== 'removed')
    ?.find(payment => payment.type === 'default')
    ?.amount || 0
  );

  nonRemovedShippings = computed(() => this.order()
    .shippings
    ?.filter(shipping => shipping.state !== 'removed') || []
  );
}
