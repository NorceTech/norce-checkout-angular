import {inject, Injectable, signal} from '@angular/core';
import {DataService} from '~/app/core/order/data.service';
import {catchError, distinctUntilChanged, EMPTY, filter, map, Observable, retry, shareReplay, switchMap} from 'rxjs';
import {ToastService} from '~/app/core/toast/toast.service';
import {Order, Payment} from '~/openapi/order';
import {ContextService} from '~/app/core/context/context.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {toObservable} from '@angular/core/rxjs-interop';
import {toObservableSignal} from 'ngxtension/to-observable-signal';
import {connect} from 'ngxtension/connect';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);
  private syncService = inject(SyncService);

  order$ = toObservableSignal(signal<Order>({channel: '', merchant: ''}));

  currency$ = this.order$.pipe(
    map(order => order.currency),
    filter(currency => typeof currency !== 'undefined'),
    distinctUntilChanged(),
    shareReplay(1)
  )
  culture$ = this.order$.pipe(
    map(order => order.culture),
    filter(culture => typeof culture !== 'undefined'),
    distinctUntilChanged(),
    shareReplay(1)
  )

  private nonRemovePayments$: Observable<Payment[]> = this.order$.pipe(
    map(order => order.payments?.filter(payment => payment.state !== 'removed')),
    filter(payments => typeof payments !== 'undefined'),
    shareReplay(1)
  )

  nonRemovedShippings$: Observable<Payment[]> = this.order$.pipe(
    map(order => order.shippings?.filter(shipping => shipping.state !== 'removed')),
    filter(shippings => typeof shippings !== 'undefined'),
    shareReplay(1)
  )
  hasShipping$ = this.order$.pipe(
    map(order => !!order.shippings?.some(payment => {
      return payment.state !== 'removed'
    })),
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

    connect(this.order$)
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
