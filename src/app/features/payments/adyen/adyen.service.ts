import {computed, inject, Injectable} from '@angular/core';
import {DataService} from '~/app/features/payments/adyen/data.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {catchError, EMPTY, Observable, retry} from 'rxjs';
import {NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder} from '~/openapi/adyen-adapter';
import {IPaymentService} from '~/app/features/payments/payment.service.interface';
import {ADAPTERS} from '~/app/core/adapter';
import {ContextService} from '~/app/core/context/context.service';

@Injectable({
  providedIn: 'root'
})
export class AdyenService implements IPaymentService {
  private adapters = inject(ADAPTERS);
  readonly adapterId = this.adapters.payment.Adyen;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);

  private orderId = computed(() => this.contextService.context()?.orderId || '');

  createPayment(): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.dataService.createPayment(this.orderId()).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create adyen payment');
        return EMPTY;
      }),
    )
  }

  getPayment(paymentId: string): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.dataService.getPayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch adyen payment');
        return EMPTY;
      })
    )
  }

  removePayment(paymentId: string): Observable<void> {
    return this.dataService.removePayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove adyen payment');
        return EMPTY;
      }),
    )
  }

  startTransaction(paymentId: string, transaction: any): Observable<any> {
    return this.dataService.startTransaction(this.orderId(), paymentId, transaction).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to start adyen transaction');
        return EMPTY;
      }),
    )
  }

  submitDetails(paymentId: string, details: any): Observable<any> {
    return this.dataService.submitDetails(this.orderId(), paymentId, details).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to submit adyen details');
        return EMPTY;
      }),
    )
  }
}
