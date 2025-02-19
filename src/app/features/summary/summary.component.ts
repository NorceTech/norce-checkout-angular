import {Component, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {AsyncPipe} from '@angular/common';
import {PricePipe} from '~/app/shared/pipes/price.pipe';

@Component({
  selector: 'app-summary',
  imports: [
    AsyncPipe,
    PricePipe
  ],
  templateUrl: './summary.component.html',
})
export class SummaryComponent {
  private orderService = inject(OrderService);

  order$ = this.orderService.order$;
}
