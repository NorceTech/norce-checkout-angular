import {inject, Injectable} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {Adapter} from '~/app/core/adapter';

@Injectable({
  providedIn: 'root'
})
export class WalleyService {
  private orderService = inject(OrderService);
  private walleyPayment$ = this.orderService.getPayment(Adapter.Walley);

  
}
