import {Component, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {AsyncPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {InputNumberModule} from 'primeng/inputnumber';
import {Item} from '~/openapi/order';
import {PlatformAdapterService} from '~/app/core/platform/platform';
import {BehaviorSubject, combineLatestWith, filter, finalize, map, take} from 'rxjs';
import {PricePipe} from '~/app/shared/pipes/price.pipe';
import {SyncService} from '~/app/core/sync/sync.service';
import {CartService} from '~/app/features/cart/cart.service';

@Component({
  selector: 'app-cart',
  imports: [
    FormsModule,
    TableModule,
    InputNumberModule,
    AsyncPipe,
    PricePipe,
  ],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private cartService = inject(CartService);

  items = this.cartService.items;

  onChange(item: Item, quantity: number) {
    const newItem = {...item, quantity};
    newItem.total = {
      includingVat: newItem.price!.includingVat! * quantity,
      excludingVat: newItem.price!.excludingVat! * quantity,
    };
    this.cartService.updateItem$.next(newItem);
  }
}
