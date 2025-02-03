import {inject, Injectable} from '@angular/core';
import {DataService} from '~/app/core/order/data.service';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  mergeWith,
  Observable,
  retry,
  shareReplay,
  switchMap
} from 'rxjs';
import {ToastService} from '~/app/core/toast/toast.service';
import {Order, Payment} from '~/openapi/order';
import {ContextService} from '~/app/core/context/context.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {Adapter} from '~/app/core/adapter';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);
  private syncService = inject(SyncService);

  order$ = this.getOrder();

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

  nonRemovePayments$: Observable<Payment[]> = this.order$.pipe(
    map(order => order.payments?.filter(payment => payment.state !== 'removed')),
    filter(payments => typeof payments !== 'undefined'),
    shareReplay(1)
  )

  defaultPayment$ = this.nonRemovePayments$.pipe(
    map(payments => payments.find(payment => payment.type === 'default')),
    filter(payment => typeof payment !== 'undefined'),
  );

  getPayment(adapter: Adapter): Observable<Payment> {
    return this.nonRemovePayments$.pipe(
      map(payments => payments.find(payment => payment.adapterId === adapter)),
      filter(payment => typeof payment !== 'undefined'),
    )
  }

  private getOrder(): Observable<Order> {
    return this.contextService.context$
      .pipe(
        mergeWith(
          this.syncService.getRefreshStream().pipe(
            switchMap(() => this.contextService.context$)
          )
        ),
        switchMap(ctx => {
          return this.dataService.getOrder(ctx.orderId)
            .pipe(
              retry(2),
              catchError(() => {
                this.toastService.error('Failed to fetch order data');
                return EMPTY;
              })
            )
        }),
        shareReplay(1)
      )
  }
}
