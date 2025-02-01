import {inject, Injectable} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {Adapter} from '~/app/core/adapter';
import {DataService} from '~/app/checkout/payments/walley/data.service';
import {
  catchError,
  combineLatestWith,
  distinctUntilChanged,
  EMPTY,
  finalize,
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
import {RefreshService} from '~/app/core/refresh/refresh.service';

@Injectable({
  providedIn: 'root'
})
export class WalleyService {
  private dataService = inject(DataService);
  private orderService = inject(OrderService);
  private contextService = inject(ContextService);
  private configService = inject(ConfigService);
  private toastService = inject(ToastService);
  private refreshService = inject(RefreshService);

  private baseUrl$: Observable<string> = this.configService.getConfig(Adapter.Walley).pipe(
    map(config => (config as any)?.adapter?.internalUrl),
    map(url => `${url}/api/checkout/v1`),
    distinctUntilChanged(),
    shareReplay(1),
  )
  private orderPayment$ = this.orderService.getPayment(Adapter.Walley);

  getPayment(): Observable<WalleyCheckoutOrder> {
    return this.contextService.$context.pipe(
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

  updateCustomer(): Observable<void> {
    return this.contextService.$context.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.updateCustomer(baseUrl, ctx, payment.id!).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to update customer');
            return EMPTY;
          }),
          finalize(() => this.refreshService.triggerRefresh())
        )
      }),
    )
  }

  updateShippingOption(): Observable<void> {
    return this.contextService.$context.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.updateShippingOption(baseUrl, ctx, payment.id!).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to update shipping option');
            return EMPTY;
          }),
          finalize(() => this.refreshService.triggerRefresh())
        )
      }),
    )
  }
}
