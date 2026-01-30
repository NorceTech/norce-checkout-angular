import { Component, computed, inject } from '@angular/core';
import { EMPTY, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VoucherFormService } from '~/app/features/vouchers/voucher-form.service';
import { SyncService } from '~/app/core/sync/sync.service';
import { DynamicFormComponent } from '~/app/shared/dynamic-form/dynamic-form.component';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-voucher-form',
  imports: [DynamicFormComponent, Select],
  templateUrl: './voucher-form.component.html',
})
export class VoucherFormComponent {
  private syncService = inject(SyncService);
  private voucherFormService = inject(VoucherFormService);

  selectedService = computed(() => this.voucherFormService.selectedService());
  enabledServices = computed(() => this.voucherFormService.enabledServices());
  select$ = this.voucherFormService.select$;

  dynamicFormFields = computed(() => this.selectedService()?.formFields || []);
  submit$ = new Subject<any>();

  constructor() {
    this.submit$
      .pipe(
        takeUntilDestroyed(),
        switchMap((payload) => {
          const service = this.voucherFormService.selectedService();
          if (!service) return EMPTY;
          return service.createPayment(payload);
        }),
      )
      .subscribe(() => this.syncService.triggerRefresh());
  }
}
