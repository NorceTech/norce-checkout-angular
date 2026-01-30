import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable} from 'rxjs';
import {Context} from '~/app/core/entities/context';

export interface KustomOrder {
  /** Klarna checkout order html snippet */
  htmlSnippet?: string;
  /** Norce Payment Id */
  id?: string;
  /** Klarna checkout order status */
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `/proxy/klarna-adapter/api/checkout/v1`;
  private client = inject(HttpClient);

  createPayment(orderId: string): Observable<KustomOrder> {
    return this.client.post<any>(`${this.baseUrl}/orders/${orderId}/payments`, undefined)
  }

  getPayment(orderId: string, paymentId: string): Observable<KustomOrder> {
    return this.client.get<any>(`${this.baseUrl}/orders/${orderId}/payments/${paymentId}`)
  }

  removePayment(orderId: string, paymentId: string): Observable<void> {
    return this.client.post<void>(`${this.baseUrl}/orders/${orderId}/payments/${paymentId}/remove`, undefined)
  }

  updateAddress(ctx: Context, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/callback/orders/${ctx.orderId}/payments/${paymentId}/address-update?${ctx.toURLSearchParams().toString()}`,
      undefined
    )
  }

  updateShippingOption(ctx: Context, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/callback/orders/${ctx.orderId}/payments/${paymentId}/shipping-option-update?${ctx.toURLSearchParams().toString()}`,
      undefined
    )
  }
}
