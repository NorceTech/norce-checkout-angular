import {inject, Injectable} from '@angular/core';
import {DataService} from '~/app/checkout/payments/adyen/data.service';
import {OrderService} from '~/app/core/order/order.service';
import {ContextService} from '~/app/core/context/context.service';
import {ConfigService} from '~/app/core/config/config.service';
import {ToastService} from '~/app/core/toast/toast.service';
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
import {Adapter} from '~/app/core/adapter';
import {NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder} from '~/openapi/adyen-adapter';

@Injectable({
  providedIn: 'root'
})
export class AdyenService {
  private dataService = inject(DataService);
  private orderService = inject(OrderService);
  private contextService = inject(ContextService);
  private configService = inject(ConfigService);
  private toastService = inject(ToastService);

  private baseUrl$: Observable<string> = this.configService.getConfig(Adapter.Adyen).pipe(
    map(config => (config as any)?.adapter?.internalUrl),
    map(url => `${url}/api/checkout/v1`),
    distinctUntilChanged(),
    shareReplay(1),
  )
  private orderPayment$ = this.orderService.getPayment(Adapter.Adyen).pipe(
    distinctUntilKeyChanged('id'),
  )

  createPayment(): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$),
    ).pipe(
      switchMap(([ctx, baseUrl]) => {
        return this.dataService.createPayment(baseUrl, ctx.orderId).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to create adyen payment');
            return EMPTY;
          }),
        )
      }),
    )
  }

  getPayment(): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.getPayment(baseUrl, ctx.orderId, payment.id!).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to fetch adyen payment');
            return EMPTY;
          })
        )
      })
    )
  }

  startTransaction(transaction: any): Observable<any> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.startTransaction(baseUrl, ctx.orderId, payment.id!, transaction).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to start adyen transaction');
            return EMPTY;
          }),
        )
      }),
    )
  }

  submitDetails(details: any): Observable<any> {
    return this.contextService.context$.pipe(
      combineLatestWith(this.baseUrl$, this.orderPayment$),
    ).pipe(
      switchMap(([ctx, baseUrl, payment]) => {
        return this.dataService.submitDetails(baseUrl, ctx.orderId, payment.id!, details).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error('Failed to submit adyen details');
            return EMPTY;
          }),
        )
      }),
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
            this.toastService.error('Failed to remove adyen payment');
            return EMPTY;
          }),
        )
      }),
    )
  }
}
