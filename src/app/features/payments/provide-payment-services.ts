import { InjectionToken, Provider } from '@angular/core';
import { IPaymentService } from '~/app/features/payments/payment.service.interface';
import { AdyenService } from '~/app/features/payments/adyen/adyen.service';
import { WalleyService } from '~/app/features/payments/walley/walley.service';
import { KustomService } from '~/app/features/payments/kustom/kustom.service';
import { QliroService } from '~/app/features/payments/qliro/qliro.service';

export const PAYMENT_SERVICES = new InjectionToken<IPaymentService[]>(
  'PAYMENT_ADAPTER',
);

export function providePaymentServices(): Provider {
  return [
    {
      provide: PAYMENT_SERVICES,
      useExisting: AdyenService,
      multi: true,
    },
    {
      provide: PAYMENT_SERVICES,
      useExisting: WalleyService,
      multi: true,
    },
    {
      provide: PAYMENT_SERVICES,
      useExisting: KustomService,
      multi: true,
    },
    {
      provide: PAYMENT_SERVICES,
      useExisting: QliroService,
      multi: true,
    },
  ];
}
