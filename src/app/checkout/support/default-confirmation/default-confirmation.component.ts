import {Component, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';

@Component({
  selector: 'app-default-confirmation',
  imports: [],
  templateUrl: './default-confirmation.component.html',
})
export class DefaultConfirmationComponent {
  private orderService = inject(OrderService);

  order$ = this.orderService.order$;
}
