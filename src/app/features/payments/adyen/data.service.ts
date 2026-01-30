import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder } from '~/openapi/adyen-adapter';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `/proxy/adyen-adapter/api/checkout/v1`;
  private client = inject(HttpClient);

  createPayment(
    orderId: string,
  ): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.client.post<any>(
      `${this.baseUrl}/orders/${orderId}/payments`,
      undefined,
    );
  }

  getPayment(
    orderId: string,
    paymentId: string,
  ): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.client.get<any>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}`,
    );
  }

  removePayment(orderId: string, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}/remove`,
      undefined,
    );
  }

  startTransaction(
    orderId: string,
    paymentId: string,
    transaction: any,
  ): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}/transaction`,
      transaction,
    );
  }

  submitDetails(
    orderId: string,
    paymentId: string,
    details: any,
  ): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}/details}`,
      details,
    );
  }
}
