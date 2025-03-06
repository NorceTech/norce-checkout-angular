import {Observable} from 'rxjs';
import {DynamicFormControl} from '~/app/shared/dynamic-form/dynamic-form.types';

export interface IVoucherService {
  adapterId: string;

  formFields: DynamicFormControl[];

  createPayment(payload: any): Observable<any>;

  removePayment(paymentId: string): Observable<any>;
}
