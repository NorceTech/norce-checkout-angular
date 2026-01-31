import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NonpspPayment } from '~/openapi/nonpsp-adapter';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `/proxy/nonpsp-adapter/api/checkout/v1`;
  private client = inject(HttpClient);

  createPayment(orderId: string): Observable<NonpspPayment> {
    return this.client.post<NonpspPayment>(
      `${this.baseUrl}/orders/${orderId}/payments`,
      undefined,
    );
  }

  getPayment(orderId: string, paymentId: string): Observable<NonpspPayment> {
    return this.client.get<NonpspPayment>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}`,
    );
  }

  removePayment(orderId: string, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}/remove`,
      undefined,
    );
  }

  updatePayment(
    orderId: string,
    paymentId: string,
    selectedPaymentMethod: string,
  ): Observable<NonpspPayment> {
    return this.client.put<NonpspPayment>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}`,
      { selectedPaymentMethod },
    );
  }

  completePayment(orderId: string, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}/complete`,
      undefined,
    );
  }
}
