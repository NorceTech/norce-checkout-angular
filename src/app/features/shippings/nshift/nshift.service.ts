import { computed, inject, Injectable } from '@angular/core';
import { DataService } from '~/app/features/shippings/nshift/data.service';
import { ToastService } from '~/app/core/toast/toast.service';
import { catchError, delay, EMPTY, Observable, retry } from 'rxjs';
import { NShiftSession, ShippingOption } from '~/openapi/nshift-adapter';
import { IShippingService } from '~/app/features/shippings/shipping.service.interface';
import { ADAPTERS, IAdapters } from '~/app/core/adapter';
import { ContextService } from '~/app/core/context/context.service';

@Injectable({
  providedIn: 'root',
})
export class NshiftService implements IShippingService {
  private adapters = inject<IAdapters>(ADAPTERS);
  readonly adapterId = this.adapters.shipping.Nshift;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);

  private orderId = computed(
    () => this.contextService.context()?.orderId || '',
  );

  createShipping(): Observable<NShiftSession> {
    return this.dataService.createShipping(this.orderId()).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to create nshift shipping');
        return EMPTY;
      }),
    );
  }

  getShipping(shippingId: string): Observable<NShiftSession> {
    return this.dataService.getShipping(this.orderId(), shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to fetch nshift shipping');
        return EMPTY;
      }),
    );
  }

  removeShipping(shippingId: string): Observable<void> {
    return this.dataService.removeShipping(this.orderId(), shippingId).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error('Failed to remove nshift shipping');
        return EMPTY;
      }),
    );
  }

  updateShipping(
    shippingId: string,
    selectionResult: ShippingOption,
  ): Observable<void> {
    return this.dataService
      .updateShipping(this.orderId(), shippingId, selectionResult)
      .pipe(
        delay(50),
        retry({ count: 3, delay: 20 }),
        catchError(() => {
          this.toastService.error('Failed to update shipping option');
          return EMPTY;
        }),
      );
  }
}
