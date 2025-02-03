import {inject, Injectable} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {Adapter} from '~/app/core/adapter';
import {DataService} from '~/app/checkout/payments/walley/data.service';
import {catchError, combineLatestWith, distinctUntilKeyChanged, EMPTY, Observable, retry, switchMap} from 'rxjs';
import {WalleyCheckoutOrder} from '~/openapi/walley-adapter';
import {ContextService} from '~/app/core/context/context.service';
import {ToastService} from '~/app/core/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class WalleyService {
  private dataService = inject(DataService);
  private orderService = inject(OrderService);
  private contextService = inject(ContextService);
  private toastService = inject(ToastService);

  private orderPayment$ = this.orderService.getPayment(Adapter.Walley).pipe(
    distinctUntilKeyChanged('id'),
  )

  createPayment(): Observable<WalleyCheckoutOrder> {
    return this.contextService.context$.pipe(
      switchMap((ctx) => {
        return this.dataService.createPayment(ctx.orderId).pipe(
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
      combineLatestWith(this.orderPayment$),
    ).pipe(
      switchMap(([ctx, payment]) => {
        return this.dataService.getPayment(ctx.orderId, payment.id!).pipe(
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
      combineLatestWith(this.orderPayment$),
    ).pipe(
      switchMap(([ctx, payment]) => {
        return this.dataService.removePayment(ctx.orderId, payment.id!).pipe(
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
      combineLatestWith(this.orderPayment$),
    ).pipe(
      switchMap(([ctx, payment]) => {
        return this.dataService.updateCustomer(ctx, payment.id!).pipe(
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
      combineLatestWith(this.orderPayment$),
    ).pipe(
      switchMap(([ctx, payment]) => {
        return this.dataService.updateShippingOption(ctx, payment.id!).pipe(
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
