import { Component, computed, inject, signal } from '@angular/core';
import { NonpspService } from '~/app/features/payments/nonpsp/nonpsp.service';
import { OrderService } from '~/app/core/order/order.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { RadioButton } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, filter, of, Subject, switchMap } from 'rxjs';
import { NonpspPayment } from '~/openapi/nonpsp-adapter';
import { connect } from 'ngxtension/connect';
import { SyncService } from '~/app/core/sync/sync.service';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-nonpsp',
  imports: [
    ProgressSpinner,
    RadioButton,
    FormsModule,
    ButtonDirective,
    ButtonLabel,
    AsyncPipe,
  ],
  templateUrl: './nonpsp.component.html',
})
export class NonpspComponent {
  private nonpspService = inject(NonpspService);
  private orderService = inject(OrderService);
  private syncService = inject(SyncService);

  private paymentId = computed(() => {
    return this.orderService
      .order()
      .payments?.filter((payment) => payment.state !== 'removed')
      .find((payment) => payment.adapterId === this.nonpspService.adapterId)
      ?.id;
  });

  private _payment = signal<NonpspPayment>({});
  payment = this._payment.asReadonly();

  readonly containerId = 'nonpsp-container';

  selectPaymentMethod$ = new Subject<string>();
  completePayment$ = new Subject<void>();

  hasInFlightRequest$ = this.syncService.hasInFlightRequest$;

  constructor() {
    const getPayment$ = this.nonpspService
      .getPayment(this.paymentId()!)
      .pipe(
        filter((payment): payment is NonpspPayment => payment !== undefined),
      );
    const updatePayment$ = this.selectPaymentMethod$.pipe(
      takeUntilDestroyed(),
      switchMap((identifier) => {
        return this.nonpspService
          .updatePayment(this.paymentId()!, identifier)
          .pipe(
            catchError(() => {
              return of(this.payment());
            }),
          );
      }),
    );
    connect(this._payment).with(getPayment$).with(updatePayment$);

    this.completePayment$
      .pipe(
        takeUntilDestroyed(),
        switchMap(() => this.nonpspService.completePayment(this.paymentId()!)),
      )
      .subscribe(() => this.syncService.triggerRefresh());
  }
}
