import {inject, Injectable} from '@angular/core';
import {DataService} from '~/app/checkout/payments/adyen/data.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {catchError, EMPTY, Observable, retry} from 'rxjs';
import {NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder} from '~/openapi/adyen-adapter';
import {PaymentAdapterService} from '~/app/checkout/payments/payment.service.interface';
import {PaymentAdapter} from '~/app/core/adapter';

@Injectable({
  providedIn: 'root'
})
export class AdyenService implements PaymentAdapterService {
  readonly adapterId = PaymentAdapter.Adyen;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  createPayment(orderId: string): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.dataService.createPayment(orderId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create adyen payment');
        return EMPTY;
      }),
    )
  }

  getPayment(orderId: string, paymentId: string): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.dataService.getPayment(orderId, paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch adyen payment');
        return EMPTY;
      })
    )
  }

  removePayment(orderId: string, paymentId: string): Observable<void> {
    return this.dataService.removePayment(orderId, paymentId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove adyen payment');
        return EMPTY;
      }),
    )
  }

  startTransaction(orderId: string, paymentId: string, transaction: any): Observable<any> {
    return this.dataService.startTransaction(orderId, paymentId, transaction).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to start adyen transaction');
        return EMPTY;
      }),
    )
  }

  submitDetails(orderId: string, paymentId: string, details: any): Observable<any> {
    return this.dataService.submitDetails(orderId, paymentId, details).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to submit adyen details');
        return EMPTY;
      }),
    )
  }
}
