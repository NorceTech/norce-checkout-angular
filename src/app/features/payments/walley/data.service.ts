import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable} from 'rxjs';
import {WalleyCheckoutOrder} from '~/openapi/walley-adapter'
import {Context} from '~/app/core/entities/context';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `/proxy/walley-adapter/api/checkout/v1`;
  private client = inject(HttpClient);

  createPayment(orderId: string): Observable<WalleyCheckoutOrder> {
    return this.client.post<any>(`${this.baseUrl}/orders/${orderId}/payments`, undefined)
  }

  getPayment(orderId: string, paymentId: string): Observable<WalleyCheckoutOrder> {
    return this.client.get<any>(`${this.baseUrl}/orders/${orderId}/payments/${paymentId}`)
  }

  removePayment(orderId: string, paymentId: string): Observable<void> {
    return this.client.post<void>(`${this.baseUrl}/orders/${orderId}/payments/${paymentId}/remove`, undefined)
  }

  updateCustomer(ctx: Context, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${this.baseUrl}/callback/orders/${ctx.orderId}/payments/${paymentId}/customer-update?${ctx.toURLSearchParams().toString()}`,
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
