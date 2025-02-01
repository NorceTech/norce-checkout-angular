import {Component, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.component.html',
})
export class SummaryComponent {
  private orderService = inject(OrderService);

  order$ = this.orderService.getOrder();
}
