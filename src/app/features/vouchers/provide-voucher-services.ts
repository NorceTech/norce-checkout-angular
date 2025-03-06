import {InjectionToken, Provider} from '@angular/core';
import {IVoucherService} from '~/app/features/vouchers/voucher.service.interface';
import {AwarditService} from '~/app/features/vouchers/awardit/awardit.service';

export const VOUCHER_SERVICES =
  new InjectionToken<IVoucherService[]>('VOUCHER_ADAPTER');

export function provideVoucherServices(): Provider {
  return [
    {
      provide: VOUCHER_SERVICES,
      useExisting: AwarditService,
      multi: true,
    }
  ];
}
