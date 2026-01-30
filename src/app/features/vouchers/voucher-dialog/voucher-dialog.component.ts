import { Component, computed, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { connect } from 'ngxtension/connect';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ListVouchersComponent } from '~/app/features/vouchers/list-vouchers/list-vouchers.component';
import { VoucherFormComponent } from '~/app/features/vouchers/voucher-form/voucher-form.component';

@Component({
  selector: 'app-voucher-dialog',
  imports: [Button, Dialog, ListVouchersComponent, VoucherFormComponent],
  templateUrl: './voucher-dialog.component.html',
})
export class VoucherDialogComponent {
  private _initialState = {
    visible: false,
  };
  private state = signal(this._initialState);
  visible = computed(() => this.state().visible);

  open$ = new Subject<void>();
  close$ = new Subject<void>();

  constructor() {
    connect(this.state)
      .with(this.open$, (state) => ({ ...state, visible: true }))
      .with(this.close$, (state) => ({ ...state, visible: false }));
  }
}
