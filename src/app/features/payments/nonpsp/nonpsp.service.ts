import { computed, inject, Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, retry } from 'rxjs';
import { NonpspPayment } from '~/openapi/nonpsp-adapter';
import { ToastService } from '~/app/core/toast/toast.service';
import { IPaymentService } from '~/app/features/payments/payment.service.interface';
import { ADAPTERS } from '~/app/core/adapter';
import { ContextService } from '~/app/core/context/context.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class NonpspService implements IPaymentService {
  private adapters = inject(ADAPTERS);
  readonly adapterId = this.adapters.payment.Nonpsp;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);

  private orderId = computed(
    () => this.contextService.context()?.orderId || '',
  );

  createPayment(): Observable<NonpspPayment> {
    return this.dataService.createPayment(this.orderId()).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create nonpsp payment');
        return EMPTY;
      }),
    );
  }

  getPayment(paymentId: string): Observable<NonpspPayment> {
    return this.dataService.getPayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch nonpsp payment');
        return EMPTY;
      }),
    );
  }

  removePayment(paymentId: string): Observable<void> {
    return this.dataService.removePayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove nonpsp payment');
        return EMPTY;
      }),
    );
  }

  updatePayment(
    paymentId: string,
    selectedPaymentMethod: string,
  ): Observable<NonpspPayment> {
    return this.dataService
      .updatePayment(this.orderId(), paymentId, selectedPaymentMethod)
      .pipe(
        retry(2),
        catchError(() => {
          this.toastService.error('Failed to update nonpsp payment');
          return EMPTY;
        }),
      );
  }

  completePayment(paymentId: string): Observable<void> {
    return this.dataService.completePayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to complete nonpsp payment');
        return EMPTY;
      }),
    );
  }
}
