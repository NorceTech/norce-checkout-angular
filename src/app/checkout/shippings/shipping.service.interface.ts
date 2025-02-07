import {Observable} from 'rxjs';
import {ShippingAdapter} from '~/app/core/adapter';

export interface IShippingService {
  readonly adapterId: ShippingAdapter;

  createShipping(orderId: string): Observable<any>;

  removeShipping(orderId: string, shippingId: string): Observable<any>;
}
