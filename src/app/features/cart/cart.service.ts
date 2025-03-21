import {inject, Injectable, signal} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {PlatformService} from '~/app/core/platform/platform.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {Item} from '~/openapi/order';
import {connect} from 'ngxtension/connect';
import {Subject, switchMap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private orderService = inject(OrderService);
  private platformAdapterService = inject(PlatformService);
  private syncService = inject(SyncService);

  private _items = signal<Item[]>([]);
  items = this._items.asReadonly();

  removeItem$ = new Subject<Item>();
  updateItem$ = new Subject<Item>();

  constructor() {
    connect(this._items)
      .with(() => this.orderService.order().cart?.items || [])
      .with(this.removeItem$, (items, item) => items.filter(i => i.id !== item.id))
      .with(this.updateItem$, (items, item) => {
        const idx = items.findIndex(i => i.id === item.id);
        if (idx === -1) return items;
        items.splice(idx, 1, item);
        return items;
      });

    this.updateItem$.pipe(
      takeUntilDestroyed(),
      switchMap(item => {
        return this.platformAdapterService.updateItem(item);
      }),
    ).subscribe(() => this.syncService.triggerRefresh());

    this.removeItem$.pipe(
      takeUntilDestroyed(),
      switchMap(item => {
        return this.platformAdapterService.removeItem(item);
      }),
    ).subscribe(() => this.syncService.triggerRefresh());
  }
}
