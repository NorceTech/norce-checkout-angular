import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `/proxy/ingrid-adapter/api/checkout/v1`;
  private client = inject(HttpClient);

  createShipping(orderId: string): Observable<any> {
    return this.client.post<any>(
      `${this.baseUrl}/orders/${orderId}/shippings`,
      undefined,
    );
  }

  getShipping(orderId: string, paymentId: string): Observable<any> {
    return this.client.get<any>(
      `${this.baseUrl}/orders/${orderId}/shippings/${paymentId}`,
    );
  }

  removeShipping(orderId: string, shippingId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/shippings/${shippingId}/remove`,
      undefined,
    );
  }

  updateCustomer(orderId: string, shippingId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/callback/orders/${orderId}/shippings/${shippingId}/customer-changed`,
      undefined,
    );
  }

  updateShipping(orderId: string, shippingId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/callback/orders/${orderId}/shippings/${shippingId}/shipping-changed`,
      undefined,
    );
  }
}
