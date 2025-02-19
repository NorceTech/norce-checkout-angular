import {Observable} from 'rxjs';

export interface IShippingService {
  adapterId: string;

  createShipping(orderId: string): Observable<any>;

  removeShipping(orderId: string, shippingId: string): Observable<any>;
}
