import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {filter, map, Observable} from 'rxjs';
import {CartItem} from '~/openapi/norce-adapter';
import {Context} from '~/app/core/entities/context';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private client = inject(HttpClient);
  private baseUrl = `/proxy/norce-adapter/api/v1/orders`;

  createOrder(merchant: string, channel: string, cartReference: number, culture: string): Observable<{id: string}> {
    return this.client.post<{id: string}>(
      `${this.baseUrl}`,
      {
        cartReference,
        culture
      }, {
        headers: {
          'x-merchant': merchant,
          'x-channel': channel
        }
      }
    )
  }

  updateItem(ctx: Context, itemId: string, item: CartItem): Observable<void> {
    return this.client.patch<void>(
      `${this.baseUrl}/${ctx.orderId}/cart/items/${itemId}`,
      item,
      {observe: 'response'}
    ).pipe(
      filter(response => response.status !== 202),
      map(response => response.body as void)
    )
  }

  removeItem(ctx: Context, itemId: string): Observable<void> {
    return this.client.delete<void>(
      `${this.baseUrl}/${ctx.orderId}/cart/items/${itemId}`,
    )
  }
}
