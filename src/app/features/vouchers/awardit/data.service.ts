import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GiftCard } from '~/openapi/awardit-adapter';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `/proxy/awardit-adapter/api/checkout/v1`;
  private client = inject(HttpClient);

  createPayment(
    orderId: string,
    cardId: string,
    code?: string,
  ): Observable<void> {
    const body = {
      cardId: cardId,
      code: code,
    } satisfies GiftCard;
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/payments`,
      body,
    );
  }

  removePayment(orderId: string, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/payments/${paymentId}/remove`,
      undefined,
    );
  }
}
