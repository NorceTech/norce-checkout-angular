import {inject, Injectable, signal} from '@angular/core';
import {DataService} from '~/app/core/order/data.service';
import {catchError, EMPTY, Observable, retry, switchMap} from 'rxjs';
import {ToastService} from '~/app/core/toast/toast.service';
import {Order} from '~/openapi/order';
import {ContextService} from '~/app/core/context/context.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {toObservable} from '@angular/core/rxjs-interop';
import {connect} from 'ngxtension/connect';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);
  private syncService = inject(SyncService);

  private _order = signal<Order>({channel: '', merchant: ''});
  order = this._order.asReadonly();
  order$ = toObservable(this._order);

  constructor() {
    const contextOrder$ = toObservable(this.contextService.context).pipe(
      switchMap(ctx => this.getOrder(ctx?.orderId!)),
    );
    const refreshOrder$ = this.syncService.getRefreshStream().pipe(
      switchMap(() => this.getOrder(this.contextService.context()?.orderId!)),
    )
    connect(this._order)
      .with(contextOrder$)
      .with(refreshOrder$);
  }

  private getOrder(orderId: string): Observable<Order> {
    return this.dataService.getOrder(orderId)
      .pipe(
        retry(2),
        catchError(() => {
          this.toastService.error('Failed to fetch order data');
          return EMPTY;
        })
      )
  }
}
