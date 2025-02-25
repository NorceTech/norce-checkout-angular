import {inject, Injectable, signal} from '@angular/core';
import {DataService} from '~/app/core/order/data.service';
import {catchError, EMPTY, filter, map, Observable, retry, shareReplay, switchMap} from 'rxjs';
import {ToastService} from '~/app/core/toast/toast.service';
import {Order, Payment} from '~/openapi/order';
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

  private nonRemovePayments$: Observable<Payment[]> = this.order$.pipe(
    map(order => order.payments?.filter(payment => payment.state !== 'removed')),
    filter(payments => typeof payments !== 'undefined'),
    shareReplay(1)
  )

  defaultPayment$ = this.nonRemovePayments$.pipe(
    map(payments => payments.find(payment => payment.type === 'default')),
    filter(payment => typeof payment !== 'undefined'),
  );
  hasDefaultPayment$ = this.order$.pipe(
    map(order => !!order.payments?.some(payment => {
      return payment.type === 'default' && payment.state !== 'removed'
    })),
  )

  getPayment(adapter: string): Observable<Payment> {
    return this.nonRemovePayments$.pipe(
      map(payments => payments.find(payment => payment.adapterId === adapter)),
      filter(payment => typeof payment !== 'undefined'),
    )
  }

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
