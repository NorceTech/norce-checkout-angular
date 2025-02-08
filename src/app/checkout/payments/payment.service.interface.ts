import {Observable} from 'rxjs';

export interface IPaymentService {
  adapterId: string;

  createPayment(orderId: string): Observable<any>;

  removePayment(orderId: string, paymentId: string): Observable<any>;
}
