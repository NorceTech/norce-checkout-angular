import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {environment} from "~/environments/environment";
import {Observable} from 'rxjs';
import {CartItem} from '~/openapi/norce-adapter';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private client = inject(HttpClient);

  updateItem(orderId: string, itemId: string, item: CartItem): Observable<void> {
    return this.client.patch<void>(`${environment.apiSettings.platformBaseUrl}/api/v1/orders/${orderId}/cart/items/${itemId}`, item)
  }
}
