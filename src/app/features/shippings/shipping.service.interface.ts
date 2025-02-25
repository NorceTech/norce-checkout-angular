import {Observable} from 'rxjs';

export interface IShippingService {
  adapterId: string;


  createShipping(): Observable<any>;

  getShipping(shippingId: string): Observable<any>;

  removeShipping(shippingId: string): Observable<any>;
}
