import {Component, computed, inject, signal, untracked, viewChild} from '@angular/core';
import {AwarditService} from '~/app/features/vouchers/awardit/awardit.service';
import {ReactiveFormsModule} from '@angular/forms';
import {Subject, switchMap} from 'rxjs';
import {Dialog} from 'primeng/dialog';
import {Button} from 'primeng/button';
import {connect} from 'ngxtension/connect';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SyncService} from '~/app/core/sync/sync.service';
import {OrderService} from '~/app/core/order/order.service';
import {Payment} from '~/openapi/order';
import {
  AwarditListVouchersComponent
} from '~/app/features/vouchers/awardit/awardit-list-vouchers/awardit-list-vouchers.component';
import {GiftCard} from '~/openapi/awardit-adapter';
import {
  AwarditVoucherFormComponent
} from '~/app/features/vouchers/awardit/awardit-voucher-form/awardit-voucher-form.component';

@Component({
  selector: 'app-awardit',
  imports: [
    ReactiveFormsModule,
    Dialog,
    Button,
    AwarditListVouchersComponent,
    AwarditVoucherFormComponent,
  ],
  templateUrl: './awardit.component.html',
})
export class AwarditComponent {
  private orderService = inject(OrderService);
  private awarditService = inject(AwarditService);
  private syncService = inject(SyncService);

  private _initialState = {
    visible: false,
    awarditVouchers: [] as Payment[],
  }
  private state = signal(this._initialState);
  visible = computed(() => this.state().visible);
  awarditVouchers = computed(() => this.state().awarditVouchers);

  open$ = new Subject<void>();
  close$ = new Subject<void>();
  submit$ = new Subject<GiftCard>();
  deleteVoucher$ = new Subject<Payment>();

  formRef = viewChild(AwarditVoucherFormComponent);

  constructor() {
    this.submit$.pipe(
      takeUntilDestroyed(),
      switchMap((giftCard) => this.awarditService.createPayment(giftCard.cardId!, giftCard.code)),
    ).subscribe(() => {
      this.formRef()?.giftCardForm.reset();
      this.close$.next();
      this.syncService.triggerRefresh();
    });

    connect(this.state)
      .with(this.open$, (state) => ({...state, visible: true}))
      .with(this.close$, (state) => ({...state, visible: false}))
      .with(() => {
        const state = untracked(() => this.state());
        const awarditVouchers = this.orderService.order()
            ?.payments
            ?.filter(payment => payment.adapterId === this.awarditService.adapterId)
            ?.filter(payment => payment.state !== 'removed')
          || [];
        return {
          ...state,
          awarditVouchers: awarditVouchers || [],
        }
      })

    this.deleteVoucher$.pipe(
      takeUntilDestroyed(),
      switchMap((payment) => this.awarditService.removePayment(payment.id!)),
    ).subscribe(() => {
      this.syncService.triggerRefresh();
    });
  }
}
