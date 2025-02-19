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

  private optimisticItem$ = new BehaviorSubject<Item | undefined>(undefined);
  items$ = this.orderService.order$.pipe(
    map(order => order.cart?.items),
    filter(items => !!items),
    combineLatestWith(this.optimisticItem$),
    map(([items, optimisticItem]) => {
      if (!optimisticItem) return items;
      const idx = items.findIndex(item => item.id === optimisticItem.id);
      if (typeof idx === 'undefined' || idx === -1) return items;
      items.splice(idx, 1, optimisticItem);
      return items;
    }),
  );

  onChange(item: Item, quantity: number) {
    const newItem = {...item, quantity};
    newItem.total = {
      includingVat: newItem.price!.includingVat! * quantity,
      excludingVat: newItem.price!.excludingVat! * quantity,
    };
    this.optimisticItem$.next(newItem);
    this.platformAdapterService.updateItem(newItem).pipe(
      take(1),
      finalize(() => {
        this.optimisticItem$.next(undefined);
        this.syncService.triggerRefresh();
      })
    ).subscribe()
  }
}
