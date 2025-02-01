import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {environment} from "~/environments/environment";
import {Observable} from 'rxjs';
import {Order} from '~/openapi/order';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `${environment.apiSettings.orderBaseUrl}/api/v1/checkout`;
  private client = inject(HttpClient);

  getOrder(orderId: string): Observable<Order> {
    return this.client.get<Order>(`${this.baseUrl}/orders/${orderId}`)
  }
}
