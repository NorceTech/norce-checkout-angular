import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable} from 'rxjs';
import {WalleyCheckoutOrder} from '~/openapi/walley-adapter'
import {Context} from '~/app/core/entities/Context';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private client = inject(HttpClient);

  createPayment(baseUrl: string, orderId: string): Observable<WalleyCheckoutOrder> {
    return this.client.post<any>(`${baseUrl}/orders/${orderId}/payments`, undefined)
  }

  getPayment(baseUrl: string, orderId: string, paymentId: string): Observable<WalleyCheckoutOrder> {
    return this.client.get<any>(`${baseUrl}/orders/${orderId}/payments/${paymentId}`)
  }

  removePayment(baseUrl: string, orderId: string, paymentId: string): Observable<void> {
    return this.client.post<void>(`${baseUrl}/orders/${orderId}/payments/${paymentId}/remove`, undefined)
  }

  updateCustomer(baseUrl: string, ctx: Context, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${baseUrl}/callback/orders/${ctx.orderId}/payments/${paymentId}/customer-update?${ctx.toURLSearchParams().toString()}`,
      undefined
    )
  }

  updateShippingOption(baseUrl: string, ctx: Context, paymentId: string): Observable<void> {
    return this.client.post<void>(
      `${baseUrl}/callback/orders/${ctx.orderId}/payments/${paymentId}/shipping-option-update?${ctx.toURLSearchParams().toString()}`,
      undefined
    )
  }
}
