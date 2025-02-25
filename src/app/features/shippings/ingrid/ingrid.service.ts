import {computed, inject, Injectable} from '@angular/core';
import {DataService} from '~/app/features/shippings/ingrid/data.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {catchError, EMPTY, Observable, retry} from 'rxjs';
import {IngridSession} from '~/openapi/ingrid-adapter';
import {IShippingService} from '~/app/features/shippings/shipping.service.interface';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';
import {ContextService} from '~/app/core/context/context.service';

@Injectable({
  providedIn: 'root'
})
export class IngridService implements IShippingService {
  private adapters = inject<IAdapters>(ADAPTERS);
  readonly adapterId = this.adapters.shipping.Ingrid;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);

  private orderId = computed(() => this.contextService.context()?.orderId || '');

  createShipping(): Observable<IngridSession> {
    return this.dataService.createShipping(this.orderId()).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create ingrid shipping');
        return EMPTY;
      }),
    )
  }

  getShipping(shippingId: string): Observable<IngridSession> {
    return this.dataService.getShipping(this.orderId(), shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch ingrid shipping');
        return EMPTY;
      })
    )
  }

  removeShipping(shippingId: string): Observable<void> {
    return this.dataService.removeShipping(this.orderId(), shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove ingrid shipping');
        return EMPTY;
      }),
    )
  }

  updateCustomer(shippingId: string): Observable<void> {
    return this.dataService.updateCustomer(this.orderId(), shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to update customer');
        return EMPTY;
      }),
    )
  }

  updateShipping(shippingId: string): Observable<void> {
    return this.dataService.updateShipping(this.orderId(), shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to update shipping option');
        return EMPTY;
      }),
    )
  }
}
