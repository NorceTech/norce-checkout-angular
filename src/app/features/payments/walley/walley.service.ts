import { computed, inject, Injectable } from '@angular/core';
import { DataService } from '~/app/features/payments/walley/data.service';
import { catchError, EMPTY, Observable, retry } from 'rxjs';
import { WalleyCheckoutOrder } from '~/openapi/walley-adapter';
import { ToastService } from '~/app/core/toast/toast.service';
import { IPaymentService } from '~/app/features/payments/payment.service.interface';
import { ADAPTERS } from '~/app/core/adapter';
import { ContextService } from '~/app/core/context/context.service';

@Injectable({
  providedIn: 'root',
})
export class WalleyService implements IPaymentService {
  private adapters = inject(ADAPTERS);
  readonly adapterId = this.adapters.payment.Walley;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);

  private orderId = computed(
    () => this.contextService.context()?.orderId || '',
  );

  createPayment(): Observable<WalleyCheckoutOrder> {
    return this.dataService.createPayment(this.orderId()).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create walley payment');
        return EMPTY;
      }),
    );
  }

  getPayment(paymentId: string): Observable<WalleyCheckoutOrder> {
    return this.dataService.getPayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch walley payment');
        return EMPTY;
      }),
    );
  }

  removePayment(paymentId: string): Observable<void> {
    return this.dataService.removePayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove walley payment');
        return EMPTY;
      }),
    );
  }

  updateCustomer(paymentId: string): Observable<void> {
    return this.dataService
      .updateCustomer(this.contextService.context()!, paymentId)
      .pipe(
        retry(2),
        catchError(() => {
          this.toastService.error('Failed to update customer');
          return EMPTY;
        }),
      );
  }

  updateShippingOption(paymentId: string): Observable<void> {
    return this.dataService
      .updateShippingOption(this.contextService.context()!, paymentId)
      .pipe(
        retry(2),
        catchError(() => {
          this.toastService.error('Failed to update shipping option');
          return EMPTY;
        }),
      );
  }
}
