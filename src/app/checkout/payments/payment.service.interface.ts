import {Observable} from 'rxjs';
import {PaymentAdapter} from '~/app/core/adapter';

export interface IPaymentService {
  readonly adapterId: PaymentAdapter;

  createPayment(orderId: string): Observable<any>;

  removePayment(orderId: string, paymentId: string): Observable<any>;
}
