import {Observable} from 'rxjs';

export interface IPaymentService {
  adapterId: string;

  createPayment(): Observable<any>;

  getPayment(paymentId: string): Observable<any>;

  removePayment(paymentId: string): Observable<any>;
}
