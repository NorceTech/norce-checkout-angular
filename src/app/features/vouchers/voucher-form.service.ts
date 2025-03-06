import {computed, inject, Injectable, linkedSignal} from '@angular/core';
import {ADAPTERS} from '~/app/core/adapter';
import {VOUCHER_SERVICES} from '~/app/features/vouchers/provide-voucher-services';
import {ConfigService} from '~/app/core/config/config.service';
import {IVoucherService} from '~/app/features/vouchers/voucher.service.interface';
import {ToastService} from '~/app/core/toast/toast.service';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoucherFormService {
  private adapters = inject(ADAPTERS);
  private voucherAdapters = Object.values(this.adapters.voucher || []);
  private voucherServices = inject(VOUCHER_SERVICES);
  private configs = inject(ConfigService);
  private toastService = inject(ToastService);

  select$ = new Subject<IVoucherService>();

  enabledServices = computed(() => {
    const configs = this.configs.configs();
    if (!configs) return [];

    return configs
      .filter(config => {
        const isActive = config['active'] === true;
        const isVoucher = this.voucherAdapters.includes(config.id);
        const hasVoucherService = this.voucherServices.some(service => service.adapterId === config.id)
        if (isVoucher && !hasVoucherService) {
          this.toastService.warn(`Voucher service for ${config.id} is not available`);
        }
        return isActive && isVoucher && hasVoucherService;
      })
      .map(config => this.voucherServices.find(service => service.adapterId === config.id)!);
  });
  selectedService = linkedSignal(() => this.enabledServices()[0])
}
