import { Component, computed, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { PricePipe } from '~/app/shared/pipes/price.pipe';
import { OrderService } from '~/app/core/order/order.service';
import { VOUCHER_SERVICES } from '~/app/features/vouchers/provide-voucher-services';
import { Payment } from '~/openapi/order';
import { EMPTY, Subject, switchMap } from 'rxjs';
import { ToastService } from '~/app/core/toast/toast.service';
import { SyncService } from '~/app/core/sync/sync.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-list-vouchers',
  imports: [Button, PricePipe],
  templateUrl: './list-vouchers.component.html',
})
export class ListVouchersComponent {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private services = inject(VOUCHER_SERVICES);
  private syncService = inject(SyncService);

  vouchers = computed(() =>
    this.orderService
      .order()
      ?.payments?.filter((payment) => payment.state !== 'removed')
      ?.filter((payment) => payment.type === 'voucher'),
  );

  deleteVoucher$ = new Subject<Payment>();

  constructor() {
    this.deleteVoucher$
      .pipe(
        takeUntilDestroyed(),
        switchMap((payment) => {
          const service = this.services.find(
            (service) => service.adapterId === payment.adapterId,
          );
          if (!service) {
            this.toastService.error(
              `Voucher service for ${payment.adapterId} is not available`,
            );
            return EMPTY;
          }
          return service.removePayment(payment.id!);
        }),
      )
      .subscribe(() => this.syncService.triggerRefresh());
  }
}
