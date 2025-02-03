import {inject, Injectable} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {Adapter} from '~/app/core/adapter';
import {DataService} from '~/app/checkout/payments/walley/data.service';
import {
  catchError,
  combineLatestWith,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  EMPTY,
  map,
  Observable,
  retry,
  shareReplay,
  switchMap
} from 'rxjs';
import {WalleyCheckoutOrder} from '~/openapi/walley-adapter';
import {ContextService} from '~/app/core/context/context.service';
import {ConfigService} from '~/app/core/config/config.service';
import {ToastService} from '~/app/core/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class WalleyService {
  private dataService = inject(DataService);
  private orderService = inject(OrderService);
  private contextService = inject(ContextService);
  private configService = inject(ConfigService);
  private toastService = inject(ToastService);

  private baseUrl$: Observable<string> = this.configService.getConfig(Adapter.Walley).pipe(
    map(config => (config as any)?.adapter?.internalUrl),
    map(url => `${url}/api/checkout/v1`),
    distinctUntilChanged(),
    shareReplay(1),
  )
  private orderPayment$ = this.orderService.getPayment(Adapter.Walley).pipe(
    distinctUntilKeyChanged('id'),
  )

  createPayment(): Observable<WalleyCheckoutOrder> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$),
    ).pipe(
      switchMap(([ctx, baseUrl]) => {
        return this.dataService.createPayment(baseUrl, ctx.orderId).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to create walley payment');
            return EMPTY;
          }),
        )
      }),
    )
  }

  getPayment(): Observable<WalleyCheckoutOrder> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.getPayment(baseUrl, ctx.orderId, payment.id!).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to fetch walley payment');
            return EMPTY;
          })
        )
      })
    )
  }

  removePayment(): Observable<void> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.removePayment(baseUrl, ctx.orderId, payment.id!).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to remove walley payment');
            return EMPTY;
          }),
        )
      }),
    )
  }

  updateCustomer(): Observable<void> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.updateCustomer(baseUrl, ctx, payment.id!).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to update customer');
            return EMPTY;
          }),
        )
      }),
    )
  }

  updateShippingOption(): Observable<void> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.updateShippingOption(baseUrl, ctx, payment.id!).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to update shipping option');
            return EMPTY;
          }),
        )
      }),
    )
  }
}
