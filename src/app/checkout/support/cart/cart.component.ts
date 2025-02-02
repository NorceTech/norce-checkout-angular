import {Component, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {AsyncPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {InputNumberModule} from 'primeng/inputnumber';
import {Item} from '~/openapi/order';
import {PlatformAdapterService} from '~/app/core/platform/platform';
import {filter, finalize, map, take} from 'rxjs';
import {PricePipe} from '~/app/shared/pipes/price.pipe';
import {SyncService} from '~/app/core/sync/sync.service';

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
  private orderService = inject(OrderService);
  private platformAdapterService = inject(PlatformAdapterService);
  private syncService = inject(SyncService);

  items$ = this.orderService.order$.pipe(
    map(order => order.cart?.items),
    filter(items => !!items)
  )

  onChange(item: Item, quantity: number) {
    this.platformAdapterService.updateItem({...item, quantity}).pipe(
      take(1),
      finalize(() => this.syncService.triggerRefresh())
    ).subscribe()
  }
}
