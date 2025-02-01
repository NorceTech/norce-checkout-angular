import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {distinctUntilChanged, map, Observable, shareReplay, switchMap} from 'rxjs';
import {ConfigService} from '~/app/core/config/config.service';
import {Adapter} from '~/app/core/adapter';
import {WalleyCheckoutOrder} from '~/openapi/walley-adapter'

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private client = inject(HttpClient);

  private configService = inject(ConfigService);
  private baseUrl$: Observable<string> = this.configService.getConfig(Adapter.Walley).pipe(
    map(config => (config as any)?.adapter?.internalUrl),
    map(url => `${url}/api/checkout/v1`),
    distinctUntilChanged(),
    shareReplay(1),
  )

  getPayment(orderId: string, paymentId: string): Observable<WalleyCheckoutOrder> {
    return this.baseUrl$.pipe(
      switchMap(baseUrl => this.client.get<any>(`${baseUrl}/orders/${orderId}/payments/${paymentId}`))
    )
  }

  updateCustomer(orderId: string, paymentId: string): Observable<void> {
    return this.baseUrl$.pipe(
      switchMap(baseUrl => this.client.post<void>(
        `${baseUrl}/callback/orders/${orderId}/payments/${paymentId}/customer-update`, undefined
      ))
    )
  }

  updateShippingOption(orderId: string, paymentId: string): Observable<void> {
    return this.baseUrl$.pipe(
      switchMap(baseUrl => this.client.post<void>(
        `${baseUrl}/callback/orders/${orderId}/payments/${paymentId}/shipping-option-update`, undefined
      ))
    )
  }
}
