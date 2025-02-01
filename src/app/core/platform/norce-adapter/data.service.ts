import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {environment} from "~/environments/environment";
import {Observable} from 'rxjs';
import {CartItem} from '~/openapi/norce-adapter';
import {Context} from '~/app/core/entities/Context';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private client = inject(HttpClient);
  private baseUrl = `${environment.apiSettings.platformBaseUrl}/api/v1/orders`;

  updateItem(ctx: Context, itemId: string, item: CartItem): Observable<void> {
    return this.client.patch<void>(
      `${this.baseUrl}/${ctx.orderId}/cart/items/${itemId}`,
      item
    )
  }
}
