import {inject, Injectable} from '@angular/core';
import {DataService} from '~/app/checkout/payments/adyen/data.service';
import {OrderService} from '~/app/core/order/order.service';
import {ContextService} from '~/app/core/context/context.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {catchError, combineLatestWith, distinctUntilKeyChanged, EMPTY, Observable, retry, switchMap} from 'rxjs';
import {Adapter} from '~/app/core/adapter';
import {NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder} from '~/openapi/adyen-adapter';

@Injectable({
  providedIn: 'root'
})
export class AdyenService {
  private dataService = inject(DataService);
  private orderService = inject(OrderService);
  private contextService = inject(ContextService);
  private toastService = inject(ToastService);

  private orderPayment$ = this.orderService.getPayment(Adapter.Adyen).pipe(
    distinctUntilKeyChanged('id'),
  )

  createPayment(): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.contextService.context$.pipe(
      switchMap((ctx) => {
        return this.dataService.createPayment(ctx.orderId).pipe(
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
      combineLatestWith(this.orderPayment$),
    ).pipe(
      switchMap(([ctx, payment]) => {
        return this.dataService.getPayment(ctx.orderId, payment.id!).pipe(
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
      combineLatestWith(this.orderPayment$),
    ).pipe(
      switchMap(([ctx, payment]) => {
        return this.dataService.startTransaction(ctx.orderId, payment.id!, transaction).pipe(
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
      combineLatestWith(this.orderPayment$),
    ).pipe(
      switchMap(([ctx, payment]) => {
        return this.dataService.submitDetails(ctx.orderId, payment.id!, details).pipe(
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
      combineLatestWith(this.orderPayment$),
    ).pipe(
      switchMap(([ctx, payment]) => {
        return this.dataService.removePayment(ctx.orderId, payment.id!).pipe(
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
