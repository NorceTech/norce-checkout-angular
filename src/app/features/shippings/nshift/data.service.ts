import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SHOULD_COUNT_REQUEST } from '~/app/core/sync/interceptors/sync.interceptor';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `/proxy/nshift-adapter/api/checkout/v1`;
  private client = inject(HttpClient);

  createShipping(orderId: string): Observable<any> {
    return this.client.post<any>(
      `${this.baseUrl}/orders/${orderId}/shippings`,
      undefined,
    );
  }

  getShipping(orderId: string, shippingId: string): Observable<any> {
    return this.client.get<any>(
      `${this.baseUrl}/orders/${orderId}/shippings/${shippingId}`,
      {
        context: new HttpContext().set(SHOULD_COUNT_REQUEST, false),
      },
    );
  }

  removeShipping(orderId: string, shippingId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/orders/${orderId}/shippings/${shippingId}/remove`,
      undefined,
    );
  }

  updateShipping(
    orderId: string,
    shippingId: string,
    selectionResult: unknown,
  ): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/callback/orders/${orderId}/shippings/${shippingId}/shipping-changed`,
      selectionResult,
    );
  }
}
