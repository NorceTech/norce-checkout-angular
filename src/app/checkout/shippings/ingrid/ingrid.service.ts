import {inject, Injectable} from '@angular/core';
import {DataService} from '~/app/checkout/shippings/ingrid/data.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {catchError, EMPTY, Observable, retry} from 'rxjs';
import {IngridSession} from '~/openapi/ingrid-adapter';

@Injectable({
  providedIn: 'root'
})
export class IngridService {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  createShipping(orderId: string): Observable<IngridSession> {
    return this.dataService.createShipping(orderId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create ingrid shipping');
        return EMPTY;
      }),
    )
  }

  getShipping(orderId: string, shippingId: string): Observable<IngridSession> {
    return this.dataService.getShipping(orderId, shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch ingrid shipping');
        return EMPTY;
      })
    )
  }

  removeShipping(orderId: string, shippingId: string): Observable<void> {
    return this.dataService.removeShipping(orderId, shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove ingrid shipping');
        return EMPTY;
      }),
    )
  }

  updateCustomer(orderId: string, shippingId: string): Observable<void> {
    return this.dataService.updateCustomer(orderId, shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to update customer');
        return EMPTY;
      }),
    )
  }

  updateShipping(orderId: string, shippingId: string): Observable<void> {
    return this.dataService.updateShipping(orderId, shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to update shipping option');
        return EMPTY;
      }),
    )
  }
}
