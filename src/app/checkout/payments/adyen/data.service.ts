import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable} from 'rxjs';
import {NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder} from '~/openapi/adyen-adapter'

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private client = inject(HttpClient);

  createPayment(baseUrl: string, orderId: string): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.client.post<any>(`${baseUrl}/orders/${orderId}/payments`, undefined)
  }

  getPayment(baseUrl: string, orderId: string, paymentId: string): Observable<NorceCheckoutAdyenAdapterWebApiModelsAdyenCheckoutOrder> {
    return this.client.get<any>(`${baseUrl}/orders/${orderId}/payments/${paymentId}`)
  }

  removePayment(baseUrl: string, orderId: string, paymentId: string): Observable<void> {
    return this.client.post<void>(`${baseUrl}/orders/${orderId}/payments/${paymentId}/remove`, undefined)
  }

  startTransaction(baseUrl: string, orderId: string, paymentId: string, transaction: any): Observable<void> {
    return this.client.post<void>(
      `${baseUrl}/orders/${orderId}/payments/${paymentId}/transaction`,
      transaction
    )
  }

  submitDetails(baseUrl: string, orderId: string, paymentId: string, details: any): Observable<void> {
    return this.client.post<void>(
      `${baseUrl}/orders/${orderId}/payments/${paymentId}/details}`,
      details
    )
  }
}
