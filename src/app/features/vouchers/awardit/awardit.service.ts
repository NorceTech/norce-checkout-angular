import { computed, inject, Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, retry } from 'rxjs';
import { IVoucherService } from '~/app/features/vouchers/voucher.service.interface';
import { ADAPTERS } from '~/app/core/adapter';
import { ToastService } from '~/app/core/toast/toast.service';
import { ContextService } from '~/app/core/context/context.service';
import { DataService } from '~/app/features/vouchers/awardit/data.service';
import { TextControl } from '~/app/shared/dynamic-form/dynamic-form.types';

@Injectable({
  providedIn: 'root',
})
export class AwarditService implements IVoucherService {
  private adapters = inject(ADAPTERS);
  readonly adapterId = this.adapters.voucher.Awardit;
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);

  readonly formFields = [
    new TextControl({
      id: 'cardId',
      label: 'Card ID',
      required: true,
      value: '',
    }),
    new TextControl({
      id: 'code',
      label: 'Code',
      required: false,
      value: '',
    }),
  ];

  private orderId = computed(
    () => this.contextService.context()?.orderId || '',
  );

  createPayment(payload: { cardId: string; code?: string }): Observable<void> {
    return this.dataService
      .createPayment(this.orderId(), payload.cardId, payload.code)
      .pipe(
        retry(2),
        catchError((err) => {
          const errorMessage =
            err?.error?.awarditError?.errorMessages?.[0] ||
            err?.error?.message ||
            'Failed to create awardit payment';
          this.toastService.error(errorMessage, 'Could not add card');
          return EMPTY;
        }),
      );
  }

  removePayment(paymentId: string): Observable<void> {
    return this.dataService.removePayment(this.orderId(), paymentId).pipe(
      retry(2),
      catchError((err) => {
        this.toastService.error('Failed to remove awardit payment');
        return EMPTY;
      }),
    );
  }
}
