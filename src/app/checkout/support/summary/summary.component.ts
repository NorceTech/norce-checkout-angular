import {Component, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {AsyncPipe, CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-summary',
  imports: [
    AsyncPipe,
    CurrencyPipe
  ],
  templateUrl: './summary.component.html',
})
export class SummaryComponent {
  private orderService = inject(OrderService);

  order$ = this.orderService.order$;
}
