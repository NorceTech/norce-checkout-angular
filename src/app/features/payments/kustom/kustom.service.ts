import {computed, inject, Injectable} from '@angular/core';
import {DataService, KustomOrder} from '~/app/features/payments/kustom/data.service';
import {catchError, EMPTY, Observable, retry} from 'rxjs';
import {ToastService} from '~/app/core/toast/toast.service';
import {IPaymentService} from '~/app/features/payments/payment.service.interface';
import {ADAPTERS} from '~/app/core/adapter';
import {ContextService} from '~/app/core/context/context.service';

@Injectable({
  providedIn: 'root'
})
export class KustomService implements IPaymentService {
  private adapters = inject(ADAPTERS);
  readonly adapterId = this.adapters.payment.Kustom;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);

  private orderId = computed(() => this.contextService.context()?.orderId || '');

  createPayment(): Observable<KustomOrder> {
    return this.dataService.createPayment(this.orderId()).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create kustom payment');
        return EMPTY;
      }),
    )
  }

  getPayment(paymentId: string): Observable<KustomOrder> {
    return this.dataService.getPayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch kustom payment');
        return EMPTY;
      })
    )
  }

  removePayment(paymentId: string): Observable<void> {
    return this.dataService.removePayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove kustom payment');
        return EMPTY;
      }),
    )
  }

  updateAddress(paymentId: string): Observable<void> {
    return this.dataService.updateAddress(this.contextService.context()!, paymentId).pipe(
      retry(2),
      catchError((error) => {
        this.toastService.error('Failed to update address from kustom');
        throw error;
      }),
    )
  }

  updateShippingOption(paymentId: string): Observable<void> {
    return this.dataService.updateShippingOption(this.contextService.context()!, paymentId).pipe(
      retry(2),
      catchError((error) => {
        this.toastService.error('Failed to update shipping option from kustom');
        throw error;
      }),
    )
  }
}
