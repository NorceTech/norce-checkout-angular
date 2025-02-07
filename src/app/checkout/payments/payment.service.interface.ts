import {Observable} from 'rxjs';
import {PaymentAdapter} from '~/app/core/adapter';

export interface PaymentAdapterService {
  readonly adapterId: PaymentAdapter;

  createPayment(orderId: string): Observable<any>;

  removePayment(orderId: string, paymentId: string): Observable<any>;
}
