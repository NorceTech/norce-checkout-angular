import {inject, Injectable} from '@angular/core';
import {DataService} from '~/app/features/payments/walley/data.service';
import {catchError, EMPTY, Observable, retry} from 'rxjs';
import {WalleyCheckoutOrder} from '~/openapi/walley-adapter';
import {ToastService} from '~/app/core/toast/toast.service';
import {Context} from '~/app/core/entities/Context';
import {IPaymentService} from '~/app/features/payments/payment.service.interface';
import {ADAPTERS} from '~/app/core/adapter';

@Injectable({
  providedIn: 'root'
})
export class WalleyService implements IPaymentService {
  private adapters = inject(ADAPTERS);
  readonly adapterId = this.adapters.payment.Walley;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  createPayment(orderId: string): Observable<WalleyCheckoutOrder> {
    return this.dataService.createPayment(orderId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create walley payment');
        return EMPTY;
      }),
    )
  }

  getPayment(orderId: string, paymentId: string): Observable<WalleyCheckoutOrder> {
    return this.dataService.getPayment(orderId, paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch walley payment');
        return EMPTY;
      })
    )
  }

  removePayment(orderId: string, paymentId: string): Observable<void> {
    return this.dataService.removePayment(orderId, paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove walley payment');
        return EMPTY;
      }),
    )
  }

  updateCustomer(ctx: Context, paymentId: string): Observable<void> {
    return this.dataService.updateCustomer(ctx, paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to update customer');
        return EMPTY;
      }),
    )
  }

  updateShippingOption(ctx: Context, paymentId: string): Observable<void> {
    return this.dataService.updateShippingOption(ctx, paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to update shipping option');
        return EMPTY;
      }),
    )
  }
}
